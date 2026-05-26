import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseChatMessageHistory } from './db-chat-history';
import {
  Runnable,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createChatModel } from '../llm/model.factory';

@Controller('api/conversations')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private prisma: PrismaService,
  ) {}

  private createWithHistory(chain: Runnable) {
    return new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId: string) =>
        new DatabaseChatMessageHistory(this.prisma, sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { title?: string }, @Request() req) {
    return this.conversationService.create(req.user.userId, body.title);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req) {
    return this.conversationService.findByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @Request() req) {
    await this.conversationService.findById(id, req.user.userId);
    return this.messageService.getHistory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/chat')
  async chat(@Param('id') id: string, @Body() body: any, @Request() req) {
    await this.conversationService.findById(id, req.user.userId);

    const userMessage = body.input;

    console.log('[chat] Starting chat for conversation:', id);
    console.log('[chat] User input:', userMessage);

    if (!userMessage) {
      throw new Error('User input is required');
    }

    const model = createChatModel();
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant.'],
      ['placeholder', '{history}'],
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(model);
    const withHistory = this.createWithHistory(chain);

    console.log('[chat] Invoking chain with history...');

    try {
      const response = await withHistory.invoke(
        { input: userMessage },
        { configurable: { sessionId: id } },
      );

      console.log('[chat] Response received:', response);
      console.log('[chat] Response content:', response.content);
      console.log('[chat] Response content type:', typeof response.content);

      return { response: response.content };
    } catch (error) {
      console.error('[chat] Error during invoke:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.conversationService.delete(id, req.user.userId);
  }
}

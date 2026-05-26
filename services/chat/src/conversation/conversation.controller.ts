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
import { AdvancedAnalysisService } from '../llm/advanced-analysis.service';

@Controller('api/conversations')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private advancedAnalysisService: AdvancedAnalysisService,
  ) {}

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
    if (!userMessage) {
      throw new Error('User input is required');
    }

    const result = await this.advancedAnalysisService.analyze(
      req.user.userId,
      id,
      userMessage,
    );

    return {
      response: result.report,
      usedAgents: result.usedAgents,
      retrievedDocuments: result.retrievedDocuments,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.conversationService.delete(id, req.user.userId);
  }
}

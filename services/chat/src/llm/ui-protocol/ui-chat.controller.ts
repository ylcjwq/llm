/**
 * UI Chat 控制器
 * 处理结构化 UI 交互的聊天接口
 */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ConversationService } from '../../conversation/conversation.service';
import { MessageService } from '../../conversation/message.service';
import { UIResponseService } from './ui-response.service';
import { UIActionService } from './ui-action.service';
import type { UIAction } from './ui-types';

@Controller('api/ui-chat')
export class UIChatController {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private uiResponseService: UIResponseService,
    private uiActionService: UIActionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @Body() body: { modelId: string; message: string },
    @Request() req,
  ) {
    if (!body.message) {
      throw new BadRequestException('message is required');
    }

    await this.conversationService.findById(body.modelId, req.user.userId);

    const history = await this.messageService.getHistoryAsLangChainMessages(
      body.modelId,
    );

    const response = await this.uiResponseService.generateUIResponse(
      body.message,
      history,
    );

    await this.messageService.addMessage(body.modelId, 'human', body.message);
    await this.messageService.addMessage(
      body.modelId,
      'ai',
      JSON.stringify(response),
    );

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('action')
  async action(
    @Body() body: { modelId: string; action: UIAction },
    @Request() req,
  ) {
    if (!body.action) {
      throw new BadRequestException('action is required');
    }

    await this.conversationService.findById(body.modelId, req.user.userId);

    const history = await this.messageService.getHistoryAsLangChainMessages(
      body.modelId,
    );

    const response = await this.uiActionService.handleAction(
      body.action,
      undefined,
      history,
    );

    await this.messageService.addMessage(
      body.modelId,
      'human',
      JSON.stringify(body.action),
    );
    await this.messageService.addMessage(
      body.modelId,
      'ai',
      JSON.stringify(response),
    );

    return response;
  }
}

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
import { UIFlowService } from './ui-flow.service';
import type { UIAction } from './ui-types';

@Controller('api/ui-chat')
export class UIChatController {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private uiResponseService: UIResponseService,
    private uiActionService: UIActionService,
    private uiFlowService: UIFlowService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @Body() body: { sessionId: string; input?: string; action?: UIAction },
    @Request() req,
  ) {
    if (!body.input && !body.action) {
      throw new BadRequestException('input or action is required');
    }

    await this.conversationService.findById(body.sessionId, req.user.userId);

    let response;
    let messageContent: string;

    // 处理用户操作
    if (body.action) {
      const normalizedAction = this.normalizeAction(body.action);
      response = this.uiFlowService.handleAction(
        body.sessionId,
        normalizedAction,
      );
      messageContent = JSON.stringify(body.action);
    }
    // 处理文本输入
    else {
      const input = body.input!.toLowerCase();
      const isNewRequirement =
        input.includes('新需求') ||
        input.includes('提需求') ||
        input.includes('创建需求');

      if (isNewRequirement) {
        response = this.uiFlowService.initSession(body.sessionId);
      } else {
        const history = await this.messageService.getHistoryAsLangChainMessages(
          body.sessionId,
        );
        response = await this.uiResponseService.generateUIResponse(
          body.input!,
          history,
        );
      }
      messageContent = body.input!;
    }

    await this.messageService.addMessage(
      body.sessionId,
      'human',
      messageContent,
    );
    await this.messageService.addMessage(
      body.sessionId,
      'ai',
      JSON.stringify(response),
    );

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('action')
  async action(
    @Body() body: { sessionId: string; action: any },
    @Request() req,
  ) {
    if (!body.action) {
      throw new BadRequestException('action is required');
    }

    await this.conversationService.findById(body.sessionId, req.user.userId);

    const normalizedAction = this.normalizeAction(body.action);
    const response = this.uiFlowService.handleAction(
      body.sessionId,
      normalizedAction,
    );

    await this.messageService.addMessage(
      body.sessionId,
      'human',
      JSON.stringify(body.action),
    );
    await this.messageService.addMessage(
      body.sessionId,
      'ai',
      JSON.stringify(response),
    );

    return response;
  }

  private normalizeAction(action: any): UIAction {
    if (action.componentType && action.payload) {
      switch (action.componentType) {
        case 'selection':
          return {
            type: 'selection',
            selectedIds: action.payload.selectedId
              ? [action.payload.selectedId]
              : action.payload.selectedIds || [],
          };
        case 'form':
          return {
            type: 'form',
            formData: action.payload.formData || {},
          };
        case 'confirmation':
          return {
            type: 'confirmation',
            confirmed: action.payload.confirmed || false,
          };
        case 'button':
          return {
            type: 'button',
            buttonId: action.payload.buttonId || '',
          };
      }
    }
    return action;
  }
}

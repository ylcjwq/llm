/**
 * UI Protocol 模块
 * 注册 UI 响应协议相关的服务和控制器
 */
import { Module } from '@nestjs/common';
import { UIResponseService } from './ui-response.service';
import { UIActionService } from './ui-action.service';
import { UIFlowService } from './ui-flow.service';
import { UIChatController } from './ui-chat.controller';
import { ConversationModule } from '../../conversation/conversation.module';

@Module({
  imports: [ConversationModule],
  controllers: [UIChatController],
  providers: [UIResponseService, UIActionService, UIFlowService],
  exports: [UIResponseService, UIActionService, UIFlowService],
})
export class UIProtocolModule {}

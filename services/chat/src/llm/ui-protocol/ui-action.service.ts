/**
 * UI Action 处理服务
 * 处理用户在 UI 上的操作并生成下一步响应
 */
import { Injectable } from '@nestjs/common';
import type { BaseMessage } from '@langchain/core/messages';
// import { HumanMessage } from '@langchain/core/messages';
import { UIResponseService } from './ui-response.service';
import type { UIAction, AIUIResponse } from './ui-types';

@Injectable()
export class UIActionService {
  constructor(private uiResponseService: UIResponseService) {}

  /**
   * 处理用户 UI 操作
   * @param action 用户操作
   * @param sessionContext 会话上下文
   * @param history 历史消息
   */
  async handleAction(
    action: UIAction,
    sessionContext?: Record<string, any>,
    history?: BaseMessage[],
  ): Promise<AIUIResponse> {
    const actionDescription = this.formatActionDescription(action);

    return await this.uiResponseService.generateUIResponse(
      actionDescription,
      history,
      { ...sessionContext, lastAction: action },
    );
  }

  /**
   * 格式化操作描述
   */
  private formatActionDescription(action: UIAction): string {
    switch (action.type) {
      case 'selection':
        return `用户选择了：${action.selectedIds.join(', ')}`;
      case 'form':
        return `用户提交了表单：${JSON.stringify(action.formData)}`;
      case 'confirmation':
        return action.confirmed ? '用户确认了操作' : '用户取消了操作';
      case 'button':
        return `用户点击了按钮：${action.buttonId}`;
    }
  }
}

/**
 * UI 响应服务
 * 使用 Structured Output 生成结构化 UI 组件
 */
import { Injectable } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { createChatModel } from '../model.factory';
import { aiUIResponseSchema } from './ui-schemas';
import type { AIUIResponse } from './ui-types';

const SYSTEM_PROMPT = `你是需求分析系统的 UI 助手，根据用户输入生成合适的 UI 组件。

## 组件使用指南

**text**: 纯文本回复，用于简单问答、说明
**selection**: 单选/多选卡片，用于让用户选择（需求类型、优先级、状态等）
**form**: 动态表单，用于收集结构化信息（创建需求、填写详情）
**confirmation**: 确认对话框，用于重要操作前确认（提交、删除、发布）
**card**: 信息展示卡片，用于展示详情（需求详情、用户信息）
**steps**: 步骤进度条，用于展示流程进度（需求分析流程）
**table**: 数据表格，用于批量展示（需求列表、历史记录）
**action_buttons**: 操作按钮组，用于提供快捷操作

## 业务场景示例

- "我要提新需求" → selection（选择需求类型：功能需求/性能需求/bug修复）
- "查看需求 REQ-001" → card（展示需求详情）+ action_buttons（编辑/删除/分享）
- "创建功能需求" → form（标题、描述、优先级、截止日期）
- "提交需求分析" → confirmation（确认提交）+ steps（展示分析流程）
- "查看我的需求" → table（需求列表）

返回 1-3 个组件的组合，确保用户体验流畅。

**重要：你必须返回严格的 JSON 格式，格式如下：**
{
  "message": "...",
  "components": [...],
  "context": {...}
}`;

@Injectable()
export class UIResponseService {
  private model = createChatModel().withStructuredOutput(aiUIResponseSchema);

  /**
   * 生成 UI 响应
   * @param input 用户输入
   * @param history 历史消息（可选）
   * @param context 上下文信息（可选）
   */
  async generateUIResponse(
    input: string,
    history?: BaseMessage[],
    context?: Record<string, any>,
  ): Promise<AIUIResponse> {
    const messages: BaseMessage[] = [new SystemMessage(SYSTEM_PROMPT)];

    if (history) {
      messages.push(...history);
    }

    const contextStr = context ? `\n上下文：${JSON.stringify(context)}` : '';
    messages.push(new HumanMessage(`${input}${contextStr}`));

    return (await this.model.invoke(messages)) as AIUIResponse;
  }
}

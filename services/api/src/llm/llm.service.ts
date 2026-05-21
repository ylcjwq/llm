import { Injectable } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import type { BaseMessage, ToolCall } from '@langchain/core/messages';
import { createChatModel } from './model.factory';
import { requirementPrompt } from './requirement.prompt-builder';
import { requirementChain } from './requirement.chain';
import {
  checkConstraintValidityTool,
  lookupEntityDefinitionTool,
} from './tools/basic.tools';

type ToolInvoker = {
  name: string;
  invoke: (input: ToolCall['args']) => Promise<unknown>;
};

@Injectable()
export class LlmService {
  private model = createChatModel();

  /**
   * 同步调用
   */
  async invoke(input: string): Promise<string> {
    const systemMessage = new SystemMessage('你是一名需求结构化抽取助手');
    const humanMessage = new HumanMessage(
      `请从下面文本中抽取 action、constraints、entities：\n${input}`,
    );
    const messages: BaseMessage[] = [systemMessage, humanMessage];
    const response = await this.model.invoke(messages);
    return JSON.stringify(response.content);
  }

  /**
   * 流式调用
   */
  async stream(input: string) {
    return this.model.stream([
      new SystemMessage('你是一名需求结构化抽取助手'),
      new HumanMessage(`请逐步分析并输出结构化抽取结果：\n${input}`),
    ]);
  }

  /**
   * 批量调用
   */
  async batch(inputs: string[]) {
    const messageGroups = inputs.map((input) => [
      new SystemMessage('你是一名需求结构化抽取助手'),
      new HumanMessage(`请抽取 action、constraints、entities：\n${input}`),
    ]);

    const responses = await this.model.batch(messageGroups);
    return responses.map((item) => JSON.stringify(item.content));
  }

  /**
   * 模板预览：只渲染模板，不调用模型
   */
  async promptPreview(input: string): Promise<{ rendered: string }> {
    const promptValue = await requirementPrompt.invoke({ input });
    return { rendered: promptValue.toString() };
  }

  /**
   * 模板调用：渲染模板后调用模型
   */
  async promptToModel(input: string) {
    const messages = await requirementPrompt.formatMessages({ input });
    const response = await this.model.invoke(messages);
    return { result: response.content };
  }

  /**
   * Chain 同步调用
   */
  async chainInvoke(input: string) {
    const result = await requirementChain.invoke({ input });
    return { result };
  }

  /**
   * Chain 流式调用
   */
  async chainStream(input: string) {
    return await requirementChain.stream({ input });
  }

  /**
   * Chain 批量调用
   */
  async chainBatch(inputs: string[]) {
    const results = await requirementChain.batch(
      inputs.map((input) => ({ input })),
    );
    return results.map((result, i) => ({ index: i + 1, result }));
  }

  /**
   * 工具绑定调用
   */
  async toolBind(input: string) {
    const modelWithTools = this.model.bindTools([
      checkConstraintValidityTool,
      lookupEntityDefinitionTool,
    ]);

    const response = await modelWithTools.invoke([
      new SystemMessage('你可以按需要调用工具来校验约束和查询实体定义。'),
      new HumanMessage(`请分析下面需求：${input}`),
    ]);

    return {
      result: JSON.stringify(response.content),
      toolCalls: response.tool_calls as ToolCall[],
    };
  }

  /**
   * 工具循环调用（Agent模式）
   */
  async toolLoop(input: string) {
    const tools = [checkConstraintValidityTool, lookupEntityDefinitionTool];
    const toolMap: Record<string, ToolInvoker> = Object.fromEntries(
      tools.map((t) => [t.name, t as unknown as ToolInvoker]),
    );
    const modelWithTools = this.model.bindTools(tools);

    const messages: BaseMessage[] = [
      new SystemMessage('你可以调用工具来帮助完成需求抽取后的校验。'),
      new HumanMessage(
        `先抽取 action、constraints、entities，再按需要调用工具：${input}`,
      ),
    ];

    const firstResponse = await modelWithTools.invoke(messages);
    messages.push(firstResponse);

    for (const toolCall of firstResponse.tool_calls ?? []) {
      const targetTool = toolMap[toolCall.name];
      if (!targetTool) continue;
      const toolResult = await targetTool.invoke(toolCall.args);
      messages.push(
        new ToolMessage({
          tool_call_id: toolCall.id!,
          content: JSON.stringify(toolResult),
        }),
      );
    }

    const finalResponse = await modelWithTools.invoke(messages);
    return { result: finalResponse.content };
  }
}

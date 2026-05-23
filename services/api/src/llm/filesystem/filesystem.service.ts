import fs from 'node:fs';
import path from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import type { BaseMessage, ToolCall } from '@langchain/core/messages';
import { createChatModel } from '../model.factory';
import {
  queryOrderTool,
  queryProductTool,
  readFileTool,
  writeFileTool,
} from '../tools/business.tools';

const WORKSPACE_ROOT = path.join(process.cwd(), 'workspace');

function safePath(filePath: string): string {
  const resolved = path.resolve(WORKSPACE_ROOT, filePath);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error('路径不允许逃逸工作目录');
  }
  return resolved;
}

type ToolInvoker = {
  name: string;
  invoke: (input: ToolCall['args']) => Promise<unknown>;
};

@Injectable()
export class FilesystemService {
  private model = createChatModel();
  private tools = [
    queryOrderTool,
    queryProductTool,
    readFileTool,
    writeFileTool,
  ];
  private toolMap: Record<string, ToolInvoker> = Object.fromEntries(
    this.tools.map((tool) => [tool.name, tool as unknown as ToolInvoker]),
  );
  private modelWithTools = this.model.bindTools(this.tools);

  async writeFile(
    filePath: string,
    content: string,
  ): Promise<{ success: true; path: string }> {
    const full = safePath(filePath);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, content, 'utf8');
    return { success: true, path: filePath };
  }

  async fileChat(input: string) {
    const messages: BaseMessage[] = [
      new SystemMessage(
        '你是电商客服助手，可以调用工具查询订单、商品、读写文件。',
      ),
      new HumanMessage(input),
    ];

    const response = await this.modelWithTools.invoke(messages);
    messages.push(response);

    for (const toolCall of response.tool_calls ?? []) {
      const tool = this.toolMap[toolCall.name];
      if (!tool) continue;

      const result = await tool.invoke(toolCall.args);
      messages.push(
        new ToolMessage({
          tool_call_id: toolCall.id!,
          content: JSON.stringify(result),
        }),
      );
    }

    if (response.tool_calls?.length) {
      const finalResponse = await this.modelWithTools.invoke(messages);
      return { result: finalResponse.content };
    }

    return { result: response.content };
  }
}

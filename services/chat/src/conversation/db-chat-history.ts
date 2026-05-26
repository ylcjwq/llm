import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { PrismaService } from '../prisma/prisma.service';

export class DatabaseChatMessageHistory extends BaseChatMessageHistory {
  lc_namespace = ['custom', 'chat_history'];

  constructor(
    private prisma: PrismaService,
    private conversationId: string,
  ) {
    super();
  }

  async getMessages(): Promise<BaseMessage[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId: this.conversationId },
      orderBy: { createdAt: 'asc' },
    });

    console.log('[getMessages] conversationId:', this.conversationId);
    console.log(
      '[getMessages] raw messages from DB:',
      JSON.stringify(messages, null, 2),
    );

    const result = messages
      .filter((msg) => msg.content != null)
      .map((msg) => {
        switch (msg.role) {
          case 'system':
            return new SystemMessage(msg.content);
          case 'human':
            return new HumanMessage(msg.content);
          case 'ai':
            return new AIMessage(msg.content);
          case 'tool':
            return new ToolMessage({
              content: msg.content,
              tool_call_id: (msg.metadata as any)?.tool_call_id ?? '',
            });
          default:
            return new HumanMessage(msg.content);
        }
      });

    console.log('[getMessages] returning', result.length, 'messages');
    return result;
  }

  async addMessage(message: BaseMessage): Promise<void> {
    console.log('[addMessage] conversationId:', this.conversationId);
    console.log('[addMessage] message type:', message.constructor.name);
    console.log('[addMessage] message content:', message.content);
    console.log('[addMessage] message content type:', typeof message.content);

    let role = 'human';
    if (message instanceof SystemMessage) role = 'system';
    else if (message instanceof AIMessage) role = 'ai';
    else if (message instanceof ToolMessage) role = 'tool';

    const content =
      typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content);

    console.log('[addMessage] final content:', content);
    console.log('[addMessage] role:', role);

    if (!content || content === 'undefined') {
      console.warn('[addMessage] Skipping message with empty content');
      return;
    }

    await this.prisma.message.create({
      data: {
        conversationId: this.conversationId,
        role,
        content,
      },
    });

    console.log('[addMessage] Message saved successfully');
  }

  async addUserMessage(message: string | HumanMessage): Promise<void> {
    await this.addMessage(
      typeof message === 'string' ? new HumanMessage(message) : message,
    );
  }

  async addAIMessage(message: string | AIMessage): Promise<void> {
    await this.addMessage(
      typeof message === 'string' ? new AIMessage(message) : message,
    );
  }

  async clear(): Promise<void> {
    await this.prisma.message.deleteMany({
      where: { conversationId: this.conversationId },
    });
  }
}

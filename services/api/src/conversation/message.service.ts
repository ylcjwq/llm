import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async addMessage(
    conversationId: string,
    role: string,
    content: string,
    metadata?: any,
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        metadata,
      },
    });
  }

  async getHistory(conversationId: string, limit?: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async getHistoryAsLangChainMessages(
    conversationId: string,
  ): Promise<BaseMessage[]> {
    const messages = await this.getHistory(conversationId);

    return messages.map((msg) => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content);
        case 'human':
          return new HumanMessage(msg.content);
        case 'ai':
          return new AIMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }
}

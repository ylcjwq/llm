import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title?: string) {
    const conversation = await this.prisma.conversation.create({
      data: { userId, title: title ?? '新会话' },
    });

    // 自动添加欢迎消息
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ai',
        content: JSON.stringify({
          components: [
            {
              type: 'text',
              content: '欢迎使用 Autix AI 需求分析助理，请描述你的需求，或点击下方常用功能。',
            },
          ],
        }),
      },
    });

    return conversation;
  }

  async findByUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  async findById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }
    if (conversation.userId !== userId) {
      throw new ForbiddenException('无权访问该会话');
    }
    return conversation;
  }

  async delete(conversationId: string, userId: string) {
    await this.findById(conversationId, userId); // 权限校验
    return this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }
}

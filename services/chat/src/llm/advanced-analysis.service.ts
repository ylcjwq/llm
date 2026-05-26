import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../embedding/search.service';
import { OrchestratorService } from './agents/orchestrator.service';

@Injectable()
export class AdvancedAnalysisService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private orchestrator: OrchestratorService,
  ) {}

  async analyze(userId: string, conversationId: string, input: string) {
    // 1. 读取会话历史
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const history = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    // 2. 语义检索相关文档
    const retrievedDocs = await this.searchService.similaritySearch(
      input,
      userId,
      3,
    );

    const context = retrievedDocs
      .map((doc) => `[文档片段] ${doc.content}`)
      .join('\n\n');

    // 3. 拼接完整输入
    const enrichedInput = [
      history ? `历史对话：\n${history}` : '',
      context ? `相关文档：\n${context}` : '',
      `当前问题：${input}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    // 4. 调用多 Agent 分析
    const result = await this.orchestrator.orchestrate(enrichedInput);

    // 5. 写入 Message 表
    await this.prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: input,
      },
    });

    // 确定回复内容
    let responseContent = result.report;
    if (!responseContent) {
      if (result.clarificationQuestions?.length) {
        responseContent =
          '需要补充以下信息：\n' + result.clarificationQuestions.join('\n');
      } else {
        responseContent = '正在分析中，请提供更多信息以便给出完整建议。';
      }
    }

    await this.prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: responseContent,
        metadata: {
          usedAgents: result.usedAgents,
          retrievedDocuments: retrievedDocs.map((d) => ({
            chunkId: d.chunkId,
            score: d.score,
          })),
        },
      },
    });

    // 6. 返回完整分析报告
    return {
      report: responseContent,
      usedAgents: result.usedAgents,
      retrievedDocuments: retrievedDocs,
    };
  }
}

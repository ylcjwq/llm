import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PrismaService } from '../prisma/prisma.service';
import { parseFile } from './parsers/parser.factory';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class ChunkService {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {}

  async chunkDocument(documentId: string) {
    const doc = await this.prisma.document.findUniqueOrThrow({
      where: { id: documentId },
    });

    // 更新状态
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'processing' },
    });

    try {
      // 1. 解析文件
      const text = await parseFile(doc.filename, doc.mimeType);

      // 2. 分块
      const chunks = await this.splitter.createDocuments([text]);

      // 3. 写入数据库
      await this.prisma.documentChunk.createMany({
        data: chunks.map((chunk, index) => ({
          documentId,
          content: chunk.pageContent,
          chunkIndex: index,
          metadata: chunk.metadata,
        })),
      });

      // 4. 向量化
      await this.embeddingService.embedChunks(documentId);

      // 5. 更新文档状态
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'completed',
          chunkCount: chunks.length,
        },
      });

      return { chunkCount: chunks.length };
    } catch (error) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'failed' },
      });
      throw error;
    }
  }
}

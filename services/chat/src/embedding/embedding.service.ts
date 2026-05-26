import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbeddingService {
  private embeddings = new OpenAIEmbeddings({
    apiKey: process.env.EMBEDDING_API_KEY,
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    configuration: {
      baseURL: process.env.EMBEDDING_BASE_URL,
    },
  });

  constructor(private prisma: PrismaService) {}

  async embedChunks(documentId: string) {
    const chunks = await this.prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
    });

    const texts = chunks.map((chunk) => chunk.content);
    const embeddings = await this.embeddings.embedDocuments(texts);

    for (let i = 0; i < chunks.length; i++) {
      await this.prisma.$executeRaw`
        UPDATE document_chunks
        SET embedding = ${JSON.stringify(embeddings[i])}::vector
        WHERE id = ${chunks[i].id}
      `;
    }

    return { embeddedCount: chunks.length };
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return await this.embeddings.embedDocuments(texts);
  }
}

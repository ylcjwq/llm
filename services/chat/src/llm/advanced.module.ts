import { Module } from '@nestjs/common';
import { LlmModule } from './llm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { AdvancedAnalysisService } from './advanced-analysis.service';
import { AdvancedController } from './advanced.controller';

@Module({
  imports: [LlmModule, PrismaModule, EmbeddingModule],
  controllers: [AdvancedController],
  providers: [AdvancedAnalysisService],
  exports: [AdvancedAnalysisService],
})
export class AdvancedModule {}

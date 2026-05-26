import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [EmbeddingService, SearchService],
  exports: [EmbeddingService, SearchService],
})
export class EmbeddingModule {}

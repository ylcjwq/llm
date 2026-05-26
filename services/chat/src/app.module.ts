import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from './llm/llm.module';
import { AdvancedModule } from './llm/advanced.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { EmbeddingModule } from './embedding/embedding.module';

@Module({
  imports: [PrismaModule, AuthModule, LlmModule, AdvancedModule, ConversationModule, DocumentModule, EmbeddingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

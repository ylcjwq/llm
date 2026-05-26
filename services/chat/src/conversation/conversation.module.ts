import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { AdvancedModule } from '../llm/advanced.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AdvancedModule, PrismaModule],
  controllers: [ConversationController],
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class ConversationModule {}

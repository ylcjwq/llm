import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { RequirementService } from './requirement.service';
import { MemoryController } from './memory/memory.controller';
import { RunnableMemoryService } from './memory/runnable-memory.service';
import { FilesController } from './filesystem/files.controller';
import { FilesystemService } from './filesystem/filesystem.service';
import { AgentsController } from './agents/agents.controller';
import { OrchestratorService } from './agents/orchestrator.service';

@Module({
  controllers: [
    LlmController,
    MemoryController,
    FilesController,
    AgentsController,
  ],
  providers: [
    LlmService,
    RequirementService,
    RunnableMemoryService,
    FilesystemService,
    OrchestratorService,
  ],
  exports: [
    LlmService,
    RequirementService,
    RunnableMemoryService,
    FilesystemService,
    OrchestratorService,
  ],
})
export class LlmModule {}

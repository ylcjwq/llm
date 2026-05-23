import { Injectable } from '@nestjs/common';
import { RunnableMemoryService } from './memory/runnable-memory.service';
import { OrchestratorService } from './agents/orchestrator.service';
import { FilesystemService } from './filesystem/filesystem.service';

@Injectable()
export class AdvancedAnalysisService {
  constructor(
    private memory: RunnableMemoryService,
    private orchestrator: OrchestratorService,
    private files: FilesystemService,
  ) {}

  async analyze(sessionId: string, input: string) {
    const history = await this.memory.getHistory(sessionId);

    const enrichedInput = [
      history.length ? `历史上下文：${JSON.stringify(history)}` : '',
      `当前输入：${input}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const result = await this.orchestrator.orchestrate(enrichedInput);

    if (!result.clarificationQuestions?.length && result.report) {
      await this.files.writeFile(
        `tickets/EC20240315001-analysis.md`,
        result.report,
      );
    }

    const conclusion =
      result.report || result.clarificationQuestions?.join('\n') || '分析完成';
    await this.memory.appendMessage(sessionId, input, conclusion);
    return result;
  }
}

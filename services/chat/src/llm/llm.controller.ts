import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { RequirementResult } from '@repo/contracts';
import { LlmService } from './llm.service';
import { RequirementService } from './requirement.service';

interface InvokeRequestDto {
  input: string;
}

interface BatchRequestDto {
  inputs: string[];
}

@Controller('api/langchain')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    private readonly requirementService: RequirementService,
  ) {}

  /**
   * POST /api/langchain/invoke
   * 同步调用
   */
  @Post('invoke')
  @HttpCode(HttpStatus.OK)
  async invoke(@Body() body: InvokeRequestDto) {
    const result = await this.llmService.invoke(body.input);
    return { result };
  }

  /**
   * POST /api/langchain/stream
   * 流式调用
   */
  @Post('stream')
  @HttpCode(HttpStatus.OK)
  async stream(@Body() body: { input: string }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.llmService.stream(body.input);

    for await (const chunk of stream) {
      res.write(chunk.content);
    }

    res.end();
  }

  /**
   * POST /api/langchain/batch
   * 批量调用
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async batch(@Body() body: BatchRequestDto) {
    const results = await this.llmService.batch(body.inputs);
    return { results };
  }

  /**
   * POST /api/langchain/prompt-preview
   * 模板预览：只渲染模板，不调用模型
   */
  @Post('prompt-preview')
  @HttpCode(HttpStatus.OK)
  async promptPreview(@Body() body: InvokeRequestDto) {
    return await this.llmService.promptPreview(body.input);
  }

  /**
   * POST /api/langchain/prompt-to-model
   * 模板调用：渲染模板后调用模型
   */
  @Post('prompt-to-model')
  @HttpCode(HttpStatus.OK)
  async promptToModel(@Body() body: InvokeRequestDto) {
    return await this.llmService.promptToModel(body.input);
  }

  /**
   * POST /api/langchain/chain-invoke
   * Chain 同步调用
   */
  @Post('chain-invoke')
  @HttpCode(HttpStatus.OK)
  async chainInvoke(@Body() body: InvokeRequestDto) {
    return await this.llmService.chainInvoke(body.input);
  }

  /**
   * POST /api/langchain/chain-stream
   * Chain 流式调用
   */
  @Post('chain-stream')
  @HttpCode(HttpStatus.OK)
  async chainStream(@Body() body: InvokeRequestDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.llmService.chainStream(body.input);

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  }

  /**
   * POST /api/langchain/chain-batch
   * Chain 批量调用
   */
  @Post('chain-batch')
  @HttpCode(HttpStatus.OK)
  async chainBatch(@Body() body: BatchRequestDto) {
    return await this.llmService.chainBatch(body.inputs);
  }

  /**
   * POST /api/langchain/structured
   * 结构化输出
   */
  @Post('structured')
  @HttpCode(HttpStatus.OK)
  async structured(@Body() body: InvokeRequestDto): Promise<RequirementResult> {
    return this.requirementService.extract(body.input);
  }

  /**
   * POST /api/langchain/tool-bind
   * 工具绑定调用
   */
  @Post('tool-bind')
  @HttpCode(HttpStatus.OK)
  async toolBind(@Body() body: InvokeRequestDto) {
    return await this.llmService.toolBind(body.input);
  }

  /**
   * POST /api/langchain/tool-loop
   * 工具循环调用（Agent模式）
   */
  @Post('tool-loop')
  @HttpCode(HttpStatus.OK)
  async toolLoop(@Body() body: InvokeRequestDto) {
    return await this.llmService.toolLoop(body.input);
  }
}

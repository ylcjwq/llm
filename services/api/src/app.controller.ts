import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RequirementService } from './llm/requirement.service';
import type { RequirementResult } from '@repo/contracts';

@Controller()
export class AppController {
  constructor(private readonly requirementService: RequirementService) {}

  @Post('/requirement/extract')
  @HttpCode(HttpStatus.OK)
  async extract(@Body() body: { input: string }): Promise<RequirementResult> {
    return this.requirementService.extract(body.input);
  }
}

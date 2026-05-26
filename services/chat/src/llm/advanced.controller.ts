import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdvancedAnalysisService } from './advanced-analysis.service';

@Controller('api/advanced')
@UseGuards(JwtAuthGuard)
export class AdvancedController {
  constructor(
    private readonly advancedAnalysisService: AdvancedAnalysisService,
  ) {}

  @Post('analyze')
  async analyze(
    @Body() body: { conversationId: string; input: string },
    @Request() req,
  ) {
    return this.advancedAnalysisService.analyze(
      req.user.userId,
      body.conversationId,
      body.input,
    );
  }
}

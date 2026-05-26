import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  HttpCode,
} from '@nestjs/common';
import { RunnableMemoryService } from './runnable-memory.service';

@Controller('api/memory')
export class MemoryController {
  constructor(private readonly memoryService: RunnableMemoryService) {}

  @Post('chat')
  @HttpCode(200)
  async chat(@Body() body: { sessionId: string; input: string }) {
    const { sessionId, input } = body;
    return await this.memoryService.chat(sessionId, input);
  }

  @Get('history')
  async getHistory(@Query('sessionId') sessionId: string) {
    const messages = await this.memoryService.getHistory(sessionId);
    return { sessionId, messages };
  }

  @Delete('clear')
  @HttpCode(200)
  clearSession(@Body() body: { sessionId: string }) {
    const { sessionId } = body;
    this.memoryService.clearSession(sessionId);
    return { success: true, sessionId };
  }
}

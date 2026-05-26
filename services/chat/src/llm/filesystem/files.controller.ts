import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';

@Controller('api/files')
export class FilesController {
  constructor(private readonly filesystemService: FilesystemService) {}

  @Post('file-chat')
  @HttpCode(200)
  async fileChat(@Body() body: { input: string }) {
    const { input } = body;
    return await this.filesystemService.fileChat(input);
  }
}

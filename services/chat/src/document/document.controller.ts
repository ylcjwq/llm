import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { ChunkService } from './chunk.service';

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private chunkService: ChunkService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    return this.documentService.upload(req.user.userId, file);
  }

  @Get()
  async findAll(@Request() req) {
    return this.documentService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.documentService.findByUser(id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.documentService.delete(id, req.user.userId);
  }

  @Post(':id/process')
  async process(@Param('id') id: string) {
    return this.chunkService.chunkDocument(id);
  }
}

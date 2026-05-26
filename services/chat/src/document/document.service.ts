import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

const ALLOWED_MIME_TYPES = ['text/plain', 'text/markdown', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('文件大小超过限制（10MB）');
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const userDir = path.join('uploads', userId);
    const filePath = path.join(userDir, filename);

    await fs.mkdir(userDir, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    return this.prisma.document.create({
      data: {
        userId,
        filename: filePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('文档不存在');
    }

    if (document.userId !== userId) {
      throw new ForbiddenException('无权访问此文档');
    }

    return document;
  }

  async delete(documentId: string, userId: string) {
    const document = await this.findById(documentId, userId);

    await fs.unlink(document.filename).catch(() => {});
    await this.prisma.document.delete({ where: { id: documentId } });

    return { message: '删除成功' };
  }
}

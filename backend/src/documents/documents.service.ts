import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Document, DocumentStatus } from '../entities/document.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadPath: string;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectQueue('pdf-processing')
    private pdfQueue: Queue,
    private configService: ConfigService,
  ) {
    this.uploadPath =
      this.configService.get<string>('UPLOAD_DEST') || './uploads';
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async createDocument(file: Express.Multer.File): Promise<Document> {
    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    // Validate file size (10MB default)
    const maxSize = this.configService.get<number>('MAX_FILE_SIZE') || 10485760;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      );
    }

    // Save file
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    // Create document record
    const document = this.documentRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath,
      status: DocumentStatus.PENDING,
    });

    const savedDocument = await this.documentRepository.save(document);

    // Add to processing queue
    await this.pdfQueue.add('process-pdf', {
      documentId: savedDocument.id,
      filePath: savedDocument.filePath,
    });

    return savedDocument;
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['chats'],
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async updateStatus(
    id: string,
    status: DocumentStatus,
    errorMessage?: string,
  ): Promise<void> {
    await this.documentRepository.update(id, {
      status,
      errorMessage,
    });
  }
}

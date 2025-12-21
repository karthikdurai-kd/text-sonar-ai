import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10485760 }), // 10MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const document = await this.documentsService.createDocument(file);
    return {
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        filename: document.originalName,
        status: document.status,
        createdAt: document.createdAt,
      },
    };
  }

  @Get()
  async getAllDocuments() {
    const documents = await this.documentsService.findAll();
    return documents;
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }
}

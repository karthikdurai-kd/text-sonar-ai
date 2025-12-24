import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PdfProcessor } from './pdf.processor';
import { Document } from '../entities/document.entity';
import { DocumentsModule } from '../documents/documents.module';
import { Chunk } from '../entities/chunk.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Chunk]),
    BullModule.registerQueue({
      name: 'pdf-processing',
    }),
    DocumentsModule,
  ],
  providers: [PdfProcessor],
})
export class ProcessorsModule {}

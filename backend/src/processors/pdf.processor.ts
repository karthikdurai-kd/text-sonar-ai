import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from '../entities/document.entity';
import { Chunk } from '../entities/chunk.entity';
import { DocumentsService } from '../documents/documents.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

interface PdfProcessingJob {
  documentId: string;
  filePath: string;
}

interface ChunkMetadata {
  loc?: {
    pageNumber?: number;
  };
}

interface ProcessedChunk {
  pageContent: string;
  metadata: ChunkMetadata;
}

@Processor('pdf-processing')
@Injectable()
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Chunk)
    private chunkRepository: Repository<Chunk>,
    private documentsService: DocumentsService,
  ) {
    super();
  }

  // Process PDF file
  async process(job: Job<PdfProcessingJob>): Promise<void> {
    const { documentId, filePath } = job.data;
    this.logger.log(`Processing PDF: ${documentId}`);

    try {
      await this.documentsService.updateStatus(
        documentId,
        DocumentStatus.PROCESSING,
      );

      const loader = new PDFLoader(filePath, {
        splitPages: true,
      });
      const rawDocs = await loader.load();
      const numPages = rawDocs.length;

      this.logger.log(`Loaded ${numPages} pages from PDF`);

      // 1: Clean text from each page BEFORE splitting
      const cleanedDocs = rawDocs.map((doc) => ({
        ...doc,
        pageContent: this.normalizeText(doc.pageContent),
      }));

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ['\n\n', '\n', '. ', ' ', ''], // Split according to priority: "double newline", "newline", "period", "space", "empty string"
      });

      const splitDocs = await textSplitter.splitDocuments(cleanedDocs);
      this.logger.log(
        `Created ${splitDocs.length} text chunks before filtering`,
      );

      // 2: Clean chunks and filter out invalid ones
      const meaningfulChunks = splitDocs
        .map((doc) => ({
          ...doc,
          pageContent: this.cleanChunkText(doc.pageContent),
        }))
        .filter((doc) => {
          const text = doc.pageContent.trim();
          const isOnlyNumber = /^\d+$/.test(text);
          const hasLetters = /[a-zA-Z]/.test(text);
          const isLongEnough = text.length >= 30;

          return !isOnlyNumber && hasLetters && isLongEnough;
        });

      this.logger.log(
        `Filtered to ${meaningfulChunks.length} meaningful chunks (removed ${splitDocs.length - meaningfulChunks.length} invalid)`,
      );

      // 3: Remove duplicate chunks (exact text matches)
      const uniqueChunks = this.removeDuplicates(meaningfulChunks);

      this.logger.log(
        `Removed ${meaningfulChunks.length - uniqueChunks.length} duplicate chunks`,
      );

      // 4: Create entities
      const chunkEntities = uniqueChunks.map((splitDoc, index) => {
        const pageNumber = splitDoc.metadata?.loc?.pageNumber;
        return this.chunkRepository.create({
          documentId,
          text: splitDoc.pageContent,
          page: pageNumber ?? 1,
          chunkIndex: index,
        });
      });

      await this.chunkRepository.save(chunkEntities);

      await this.documentRepository.update(documentId, {
        status: DocumentStatus.COMPLETED,
        totalPages: numPages,
        totalChunks: uniqueChunks.length,
      });

      this.logger.log(
        `PDF processing completed: ${documentId} - Saved ${uniqueChunks.length} chunks`,
      );
    } catch (error) {
      this.logger.error(`Error processing PDF ${documentId}:`, error);
      await this.documentsService.updateStatus(
        documentId,
        DocumentStatus.FAILED,
        (error as Error).message || 'Unknown error occurred',
      );
      throw error;
    }
  }

  // *** Helper functions *** //

  // normalize PDF text by replacing newlines with spaces and multiple spaces with single space
  private normalizeText(text: string): string {
    return (
      text
        // Replace all newlines with spaces
        .replace(/\n+/g, ' ')
        // Replace multiple spaces/tabs with single space
        .replace(/\s+/g, ' ')
        // Remove leading/trailing whitespace
        .trim()
    );
  }

  // clean chunk text by removing trailing page numbers, leading punctuation, and normalizing whitespace
  private cleanChunkText(text: string): string {
    return (
      text
        // Remove trailing page numbers (like "1", "2", "3", "4" at end of line)
        .replace(/\s+\d+\s*$/gm, '')
        // Remove leading punctuation (periods, commas, etc.)
        .replace(/^[.,;:!?\s]+/g, '')
        // Normalize whitespace again (in case cleaning added issues)
        .replace(/\s+/g, ' ')
        // Remove leading/trailing whitespace
        .trim()
    );
  }

  // remove duplicates based on exact text match
  private removeDuplicates(chunks: ProcessedChunk[]): ProcessedChunk[] {
    const seen = new Set<string>();
    const unique: ProcessedChunk[] = [];

    for (const chunk of chunks) {
      const text = chunk.pageContent.trim();
      const normalized = text.toLowerCase().replace(/\s+/g, ' ');

      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(chunk);
      }
    }

    return unique;
  }
}

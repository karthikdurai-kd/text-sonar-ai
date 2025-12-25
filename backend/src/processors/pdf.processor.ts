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
import { EmbeddingsService } from '../services/embeddings.service';
import { PineconeService } from '../services/pinecone.service';

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
    private embeddingsService: EmbeddingsService,
    private pineconeService: PineconeService,
  ) {
    super();
  }

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

      // 3: Remove duplicate chunks
      const uniqueChunks = this.removeDuplicates(meaningfulChunks);

      this.logger.log(
        `Removed ${meaningfulChunks.length - uniqueChunks.length} duplicate chunks`,
      );

      // 4: Create chunk entities and save to database
      const chunkEntities = uniqueChunks.map((splitDoc, index) => {
        const pageNumber = splitDoc.metadata?.loc?.pageNumber;
        return this.chunkRepository.create({
          documentId,
          text: splitDoc.pageContent,
          page: pageNumber ?? 1,
          chunkIndex: index,
        });
      });

      const savedChunks = await this.chunkRepository.save(chunkEntities);
      this.logger.log(`Saved ${savedChunks.length} chunks to database`);

      // 5: Generate embeddings for all chunks
      const chunkTexts = savedChunks.map((chunk) => chunk.text);
      this.logger.log(`Generating embeddings for ${chunkTexts.length} chunks`);

      const embeddings =
        await this.embeddingsService.embedDocuments(chunkTexts);
      this.logger.log(`Generated ${embeddings.length} embeddings`);

      // 6: Prepare vectors for Pinecone
      const vectors = savedChunks.map((chunk, index) => ({
        id: `chunk_${chunk.id}`,
        values: embeddings[index],
        metadata: {
          chunkId: chunk.id,
          documentId: chunk.documentId,
          page: chunk.page,
          text: chunk.text.substring(0, 500),
        },
      }));

      // 7: Upsert vectors to Pinecone
      await this.pineconeService.upsertVectors(vectors);
      this.logger.log(`Upserted ${vectors.length} vectors to Pinecone`);

      // 8: Update chunks with vector IDs
      for (let i = 0; i < savedChunks.length; i++) {
        savedChunks[i].vectorId = vectors[i].id;
      }
      await this.chunkRepository.save(savedChunks);

      // 9: Update document status
      await this.documentRepository.update(documentId, {
        status: DocumentStatus.COMPLETED,
        totalPages: numPages,
        totalChunks: uniqueChunks.length,
      });

      this.logger.log(
        `PDF processing completed: ${documentId} - Saved ${uniqueChunks.length} chunks with embeddings`,
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
  // normalize text by replacing newlines with spaces and multiple spaces with single space
  private normalizeText(text: string): string {
    return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // clean chunk text by removing trailing page numbers, leading punctuation, and normalizing whitespace
  private cleanChunkText(text: string): string {
    return (
      text
        // Remove trailing page numbers (like "1", "2", "3", "4" at end of line)
        .replace(/\s+\d+\s*$/gm, '')
        // Remove leading punctuation (periods, commas, etc.)
        .replace(/^[.,;:!?\s]+/g, '')
        // Normalize whitespace (multiple spaces to single space)
        .replace(/\s+/g, ' ')
        // Trim whitespace
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

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService implements OnModuleInit {
  private readonly logger = new Logger(PineconeService.name);
  private pinecone: Pinecone;
  private indexName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    this.indexName =
      this.configService.get<string>('PINECONE_INDEX_NAME') ||
      'textsonar-index';

    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not set');
    }

    // initialize Pinecone client
    this.pinecone = new Pinecone({
      apiKey,
    });
  }

  async onModuleInit() {
    await this.ensureIndexExists();
  }

  private async ensureIndexExists() {
    try {
      const indexList = await this.pinecone.listIndexes();
      const indexExists = indexList.indexes?.some(
        (index) => index.name === this.indexName,
      );

      if (!indexExists) {
        this.logger.log(`Creating Pinecone index: ${this.indexName}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // OpenAI text-embedding-3-small dimensions
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1', // AWS region
            },
          },
        });
        this.logger.log(`Index ${this.indexName} created successfully`);
      } else {
        this.logger.log(`Index ${this.indexName} already exists`);
      }
    } catch (error) {
      this.logger.error('Error ensuring index exists:', error);
      throw error;
    }
  }

  getIndex() {
    return this.pinecone.index(this.indexName);
  }

  // upsert vectors to Pinecone
  async upsertVectors(
    vectors: Array<{
      id: string;
      values: number[];
      metadata: {
        chunkId: string;
        documentId: string;
        page: number;
        text: string;
      };
    }>,
  ) {
    const index = this.getIndex();
    await index.upsert(vectors);
    this.logger.log(`Upserted ${vectors.length} vectors to Pinecone`);
  }

  // query similar vectors
  async querySimilar(
    queryVector: number[],
    topK: number = 5,
    filter?: { documentId?: string },
  ) {
    const index = this.getIndex();
    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: filter ? { documentId: { $eq: filter.documentId } } : undefined,
    });

    return queryResponse.matches || [];
  }

  // delete vectors by document ID
  async deleteByDocumentId(documentId: string) {
    const index = this.getIndex();
    await index.deleteMany({
      filter: {
        documentId: { $eq: documentId },
      },
    });
    this.logger.log(`Deleted vectors for document: ${documentId}`);
  }
}

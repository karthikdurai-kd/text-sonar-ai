import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private embeddings: OpenAIEmbeddings;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: 'text-embedding-3-small', // 1536 dimensions
    });

    this.logger.log('OpenAI Embeddings initialized');
  }

  /**
   * Generate embedding for a single text
   */
  async embedText(text: string): Promise<number[]> {
    const embedding = await this.embeddings.embedQuery(text);
    return embedding;
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    this.logger.log(`Generating embeddings for ${texts.length} texts`);
    const embeddings = await this.embeddings.embedDocuments(texts);
    this.logger.log(`Generated ${embeddings.length} embeddings`);
    return embeddings;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingsService } from './embeddings.service';
import { PineconeService } from './pinecone.service';
import { Chunk } from '../entities/chunk.entity';

type Citation = {
  page: number;
  text: string;
  score?: number;
};

type RAGContext = {
  context: string;
  citations: Citation[];
};

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private llm: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private embeddingsService: EmbeddingsService,
    private pineconeService: PineconeService,
    @InjectRepository(Chunk)
    private chunkRepository: Repository<Chunk>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o',
      temperature: 0.7,
    });

    this.logger.log('RAG Service initialized with GPT-4o');
  }

  /// ********** PUBLIC METHODS **********

  // generate answer using RAG - non-streaming
  async generateAnswer(
    question: string,
    documentId: string,
    topK: number = 5,
  ): Promise<{
    answer: string;
    citations: Citation[];
  }> {
    // Retrieve context and citations (shared logic)
    const { context, citations } = await this.retrieveContext(
      question,
      documentId,
      topK,
    );

    if (context === '') {
      return {
        answer:
          "I couldn't find relevant information in the document to answer your question.",
        citations: [],
      };
    }

    // Build prompt
    const prompt = this.buildPrompt(context, question);

    // Generate answer with GPT-4o
    this.logger.log('Generating answer with GPT-4o');
    const response = await this.llm.invoke(prompt);
    const answer = response.content as string;

    this.logger.log('Answer generated successfully');

    return {
      answer,
      citations,
    };
  }

  // stream answer generation - streaming
  async *streamAnswer(
    question: string,
    documentId: string,
    topK: number = 5,
  ): AsyncGenerator<string, { citations: Citation[] }, unknown> {
    // retrieve context and citations
    const { context, citations } = await this.retrieveContext(
      question,
      documentId,
      topK,
    );

    if (context === '') {
      yield "I couldn't find relevant information in the document to answer your question.";
      return { citations: [] };
    }

    // build prompt
    const prompt = this.buildPrompt(context, question);

    // stream response from GPT-4o
    this.logger.log('Streaming answer with GPT-4o');
    const stream = await this.llm.stream(prompt);

    for await (const chunk of stream) {
      const content = chunk.content as string;
      if (content) {
        yield content;
      }
    }

    // return citations at the end
    return { citations };
  }

  /// ********** HELPER METHODS **********

  // retrieve context and citations
  private async retrieveContext(
    question: string,
    documentId: string,
    topK: number = 5,
  ): Promise<RAGContext> {
    // 1. Convert question to embedding
    this.logger.log(`Generating embedding for question: "${question}"`);
    const questionEmbedding = await this.embeddingsService.embedText(question);

    // 2. Search Pinecone for similar chunks
    this.logger.log(`Searching Pinecone for top ${topK} similar chunks`);
    const similarChunks = await this.pineconeService.querySimilar(
      questionEmbedding,
      topK,
      { documentId },
    );

    if (similarChunks.length === 0) {
      return {
        context: '',
        citations: [],
      };
    }

    this.logger.log(`Found ${similarChunks.length} relevant chunks`);

    // 3. Get full chunk text from database (not truncated metadata)
    const chunkIds = similarChunks
      .map((chunk) => chunk.metadata?.chunkId)
      .filter((id): id is string => !!id);

    const fullChunks = await this.chunkRepository.find({
      where: chunkIds.map((id) => ({ id })),
    });

    // Create a map for quick lookup
    const chunkMap = new Map(fullChunks.map((chunk) => [chunk.id, chunk]));

    // 4. Build context with FULL text from database (page numbers)
    const context = similarChunks
      .map((pineconeChunk) => {
        const chunkId = String(pineconeChunk.metadata?.chunkId || '');
        const fullChunk = chunkId ? chunkMap.get(chunkId) : null;
        const page = Number(pineconeChunk.metadata?.page) || 1;
        const text =
          fullChunk?.text || String(pineconeChunk.metadata?.text || '');

        return `[Page ${page}]: ${text}`;
      })
      .join('\n\n');

    // 5. Extract citations with full text [TODO: Match citation used by GPT-4o]
    const citations = similarChunks.map((pineconeChunk) => {
      const chunkId = String(pineconeChunk.metadata?.chunkId || '');
      const fullChunk = chunkId ? chunkMap.get(chunkId) : null;

      return {
        page: Number(pineconeChunk.metadata?.page) || 1,
        text: fullChunk?.text || String(pineconeChunk.metadata?.text || ''),
        score: pineconeChunk.score,
      };
    });

    return {
      context,
      citations,
    };
  }

  // build prompt with context and question
  private buildPrompt(context: string, question: string): string {
    return `You are a helpful assistant that answers questions based on the provided context from a document.

    Context from document:
    ${context}

    Question: ${question}

    IMPORTANT INSTRUCTIONS:
    1. ALWAYS provide an answer if the context contains ANY information related to the question, even if it's brief.
    2. Use the information from the context above to answer the question.
    3. If the context mentions the topic (even briefly), explain it based on what's provided.
    4. Cite ONLY page numbers in your answer using format: (Page X)
    5. If you reference information from multiple pages, cite them like: (Page X, Page Y)
    6. DO NOT mention "Source 1", "Source 2", "Source X" - only use page numbers.
    7. Be comprehensive and accurate based on the context.
    8. ONLY say "I couldn't find relevant information" if the context contains ZERO mention of the topic.

    Answer based on the context:`;
  }
}

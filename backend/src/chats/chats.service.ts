import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { Message, MessageRole } from '../entities/message.entity';
import { Document } from '../entities/document.entity';
import { RagService } from '../services/rag.service';

type Citation = {
  page: number;
  text: string;
  score?: number;
};

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private ragService: RagService,
  ) {}

  // create a new chat for a document
  async createChat(documentId: string, title?: string): Promise<Chat> {
    // Verify document exists
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const chat = this.chatRepository.create({
      documentId,
      title: title || `Chat about ${document.originalName}`,
    });

    return await this.chatRepository.save(chat);
  }

  // get chat by ID with messages
  async getChat(chatId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages', 'document'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    return chat;
  }

  // get all chats for a document
  async getChatsByDocument(documentId: string): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: { documentId },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  // ask a question and get answer (non-streaming)
  async askQuestion(
    chatId: string,
    question: string,
  ): Promise<{ answer: string; citations: Citation[] }> {
    const chat = await this.getChat(chatId);

    // Save user message
    const userMessage = this.messageRepository.create({
      chatId,
      role: MessageRole.USER,
      content: question,
    });
    await this.messageRepository.save(userMessage);

    // Generate answer using RAG service
    const { answer, citations } = await this.ragService.generateAnswer(
      question,
      chat.documentId,
    );

    // Save assistant message
    const assistantMessage = this.messageRepository.create({
      chatId,
      role: MessageRole.ASSISTANT,
      content: answer,
      citations,
    });
    await this.messageRepository.save(assistantMessage);

    return { answer, citations };
  }

  // stream answer generation
  async *streamAnswer(
    chatId: string,
    question: string,
  ): AsyncGenerator<string, { citations: Citation[] }, unknown> {
    const chat = await this.getChat(chatId);

    // Save user message
    const userMessage = this.messageRepository.create({
      chatId,
      role: MessageRole.USER,
      content: question,
    });
    await this.messageRepository.save(userMessage);

    let fullAnswer = '';
    let citations: Citation[] = [];

    // get the stream generator response
    const streamGenerator = this.ragService.streamAnswer(
      question,
      chat.documentId,
    );

    // Iterate through the stream
    while (true) {
      const result = await streamGenerator.next();

      if (result.done) {
        citations = result.value?.citations || [];
        break;
      }

      const chunk = result.value;
      fullAnswer += chunk;
      yield chunk;
    }

    // Save assistant message
    const assistantMessage = this.messageRepository.create({
      chatId,
      role: MessageRole.ASSISTANT,
      content: fullAnswer,
      citations,
    });
    await this.messageRepository.save(assistantMessage);

    return { citations };
  }
}

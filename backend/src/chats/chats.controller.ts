import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Observable } from 'rxjs';
import { Chat } from 'src/entities/chat.entity';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // create a new chat for a document
  @Post()
  async createChat(
    @Body() body: { documentId: string; title?: string },
  ): Promise<{ chat: Chat }> {
    const chat = await this.chatsService.createChat(
      body.documentId,
      body.title,
    );
    return { chat };
  }

  // get chat by ID with messages
  @Get(':id')
  async getChat(@Param('id') id: string) {
    return await this.chatsService.getChat(id);
  }

  // get all chats for a document
  @Get('document/:documentId')
  async getChatsByDocument(@Param('documentId') documentId: string) {
    return await this.chatsService.getChatsByDocument(documentId);
  }

  // ask a question (non-streaming)
  @Post(':id/messages')
  async askQuestion(
    @Param('id') chatId: string,
    @Body() body: { question: string },
  ) {
    const { answer, citations } = await this.chatsService.askQuestion(
      chatId,
      body.question,
    );
    return {
      answer,
      citations,
    };
  }

  // stream answer (Server-Sent Events)
  @Post(':id/stream')
  @Sse()
  streamAnswer(
    @Param('id') chatId: string,
    @Body() body: { question: string },
  ): Observable<MessageEvent> {
    return new Observable((observer) => {
      void (async () => {
        try {
          const stream = this.chatsService.streamAnswer(chatId, body.question);
          let citations: any[] = [];

          for await (const chunk of stream) {
            observer.next({
              data: JSON.stringify({ type: 'chunk', content: chunk }),
            } as MessageEvent);
          }

          // Get citations from the generator's return value
          const result = await stream.next();
          if (
            result.done &&
            result.value &&
            typeof result.value === 'object' &&
            'citations' in result.value
          ) {
            citations = result.value.citations;
          }

          observer.next({
            data: JSON.stringify({ type: 'citations', citations }),
          } as MessageEvent);

          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }
}

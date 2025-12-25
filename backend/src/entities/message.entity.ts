import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chat } from './chat.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'chat_id' })
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({
    type: 'enum',
    enum: MessageRole,
    name: 'role',
  })
  role: MessageRole;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @Column('jsonb', { nullable: true, name: 'citations' })
  citations: Array<{
    page: number;
    text: string;
    score?: number;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

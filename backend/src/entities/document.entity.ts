import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Chat } from './chat.entity';

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'filename' })
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint', name: 'size' })
  size: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
    name: 'status',
  })
  status: DocumentStatus;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage: string;

  @Column({ type: 'int', default: 0, name: 'total_pages' })
  totalPages: number;

  @Column({ type: 'int', default: 0, name: 'total_chunks' })
  totalChunks: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Chat, (chat) => chat.document)
  chats: Chat[];
}

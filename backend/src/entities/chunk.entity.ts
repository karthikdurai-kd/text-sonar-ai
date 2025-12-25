import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity('chunks')
export class Chunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ type: 'text', name: 'text' })
  text: string;

  @Column({ type: 'int', name: 'page' })
  page: number;

  @Column({ type: 'int', name: 'chunk_index' })
  chunkIndex: number;

  @Column({ type: 'int', nullable: true, name: 'start_char_index' })
  startCharIndex: number;

  @Column({ type: 'int', nullable: true, name: 'end_char_index' })
  endCharIndex: number;

  @Column({ nullable: true, name: 'vector_id' })
  vectorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

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

  @Column()
  documentId: string;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column('text')
  text: string;

  @Column({ type: 'int' })
  page: number;

  @Column({ type: 'int' })
  chunkIndex: number; // Order of chunk in document

  @Column({ type: 'int', nullable: true })
  startCharIndex: number; // Character position in original text

  @Column({ type: 'int', nullable: true })
  endCharIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}

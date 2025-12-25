import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsToSnakeCase1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename documents table columns
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "originalName" TO "original_name";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "mimeType" TO "mime_type";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "filePath" TO "file_path";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "errorMessage" TO "error_message";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "totalPages" TO "total_pages";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "totalChunks" TO "total_chunks";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "createdAt" TO "created_at";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "updatedAt" TO "updated_at";
    `);

    // Rename chats table columns
    await queryRunner.query(`
      ALTER TABLE "chats" 
      RENAME COLUMN "documentId" TO "document_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "chats" 
      RENAME COLUMN "createdAt" TO "created_at";
    `);
    await queryRunner.query(`
      ALTER TABLE "chats" 
      RENAME COLUMN "updatedAt" TO "updated_at";
    `);

    // Rename messages table columns
    await queryRunner.query(`
      ALTER TABLE "messages" 
      RENAME COLUMN "chatId" TO "chat_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "messages" 
      RENAME COLUMN "createdAt" TO "created_at";
    `);

    // Rename chunks table columns
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "documentId" TO "document_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "chunkIndex" TO "chunk_index";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "startCharIndex" TO "start_char_index";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "endCharIndex" TO "end_char_index";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "vectorId" TO "vector_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "createdAt" TO "created_at";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert documents table columns
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "original_name" TO "originalName";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "mime_type" TO "mimeType";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "file_path" TO "filePath";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "error_message" TO "errorMessage";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "total_pages" TO "totalPages";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "total_chunks" TO "totalChunks";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "created_at" TO "createdAt";
    `);
    await queryRunner.query(`
      ALTER TABLE "documents" 
      RENAME COLUMN "updated_at" TO "updatedAt";
    `);

    // Revert chats table columns
    await queryRunner.query(`
      ALTER TABLE "chats" 
      RENAME COLUMN "document_id" TO "documentId";
    `);
    await queryRunner.query(`
      ALTER TABLE "chats" 
      RENAME COLUMN "created_at" TO "createdAt";
    `);
    await queryRunner.query(`
      ALTER TABLE "chats" 
      RENAME COLUMN "updated_at" TO "updatedAt";
    `);

    // Revert messages table columns
    await queryRunner.query(`
      ALTER TABLE "messages" 
      RENAME COLUMN "chat_id" TO "chatId";
    `);
    await queryRunner.query(`
      ALTER TABLE "messages" 
      RENAME COLUMN "created_at" TO "createdAt";
    `);

    // Revert chunks table columns
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "document_id" TO "documentId";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "chunk_index" TO "chunkIndex";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "start_char_index" TO "startCharIndex";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "end_char_index" TO "endCharIndex";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "vector_id" TO "vectorId";
    `);
    await queryRunner.query(`
      ALTER TABLE "chunks" 
      RENAME COLUMN "created_at" TO "createdAt";
    `);
  }
}

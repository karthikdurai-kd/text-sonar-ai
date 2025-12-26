import { Module, Global } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { PineconeService } from './pinecone.service';
import { RagService } from './rag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chunk } from 'src/entities/chunk.entity';

@Global() // Services are available globally
@Module({
  imports: [TypeOrmModule.forFeature([Chunk])],
  providers: [EmbeddingsService, PineconeService, RagService],
  exports: [EmbeddingsService, PineconeService, RagService],
})
export class ServicesModule {}

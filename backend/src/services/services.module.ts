import { Module, Global } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { PineconeService } from './pinecone.service';

@Global() // Services are available globally
@Module({
  providers: [EmbeddingsService, PineconeService],
  exports: [EmbeddingsService, PineconeService],
})
export class ServicesModule {}

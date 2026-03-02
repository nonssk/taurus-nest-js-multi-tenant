import { Module } from '@nestjs/common';
import { KafkaConsumerService, KafkaProducerService } from './services';

@Module({
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}

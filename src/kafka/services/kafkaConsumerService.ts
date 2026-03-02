import { Injectable } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';
export type KafkaCallBack = {
  topic: string;
  message: string;
};
export type KafkaConsumerConfig = {
  config: KafkaConfig;
  groupId: string;
  topics: string[];
};

@Injectable()
export class KafkaConsumerService {
  async startConsumer(data: KafkaConsumerConfig) {
    const { config, groupId, topics } = data;
    const kafka = new Kafka(config);
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }
    return consumer;
  }
}

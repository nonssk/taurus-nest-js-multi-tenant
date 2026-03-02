import { Injectable } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';

@Injectable()
export class KafkaProducerService {
  async connect(config: KafkaConfig) {
    const kafka = new Kafka(config);
    const producer = kafka.producer();
    await producer.connect();
    return producer;
  }

  async send(config: KafkaConfig, topic: string, message: string) {
    const producer = await this.connect(config);
    const res = await producer.send({
      topic,
      messages: [{ value: message }],
    });
    return res;
  }
}

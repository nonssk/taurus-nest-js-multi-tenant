import {
  HttpException,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CustomError } from './customs';
import {
  KafkaCallBack,
  KafkaConsumerService,
  KafkaProducerService,
} from './kafka/services';
import { Consumer } from 'kafkajs';
import { Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitMQ/services';
import * as amqp from 'amqplib';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { MongoService, PostgresService } from './databases/services';

type AERROR = {
  name: string;
};

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(AppService.name);
  private consumer: Consumer | null = null;

  private rabbitMQConnection: amqp.Connection | null = null;
  private rabbitMQChannel: amqp.Channel | null = null;
  constructor(
    @Inject(CACHE_MANAGER) private memoryCache: Cache,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly kafkaConsumerService: KafkaConsumerService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly mongoService: MongoService,
    private readonly postgresService: PostgresService,
  ) {}

  async onModuleInit() {
    // await this.startRabbitMQ();
    // await this.startKafkaConsumer();
  }

  async onModuleDestroy() {
    // await this.stopRabbitMQ();
    // await this.stopKafkaConsumer();
  }

  async getMongo(tenant: string) {
    const TenantModel = await this.mongoService.TenantModel(tenant);
    return TenantModel.find().exec();
  }

  async getPostgres(tenant: string) {
    const tenantRepo = await this.postgresService.tenantRepo(tenant);
    return tenantRepo.find();
  }

  error() {
    throw new Error('Invalid error');
  }

  httpError() {
    throw new HttpException('Invalid http', 501);
  }

  customError() {
    const error: AERROR = {
      name: 'non',
    };
    throw new CustomError<AERROR>('Invalid custom', 501, error);
  }

  onMessage(data: KafkaCallBack) {
    const { topic, message } = data;
    const log = topic + ' : ' + message;
    this.logger.log(log);
  }

  async startKafkaConsumer() {
    if (this.consumer) {
      return;
    }
    const config = {
      config: { brokers: ['localhost:9092'], logLevel: 0 },
      groupId: '1234',
      topics: ['test'],
    };
    const consumer = await this.kafkaConsumerService.startConsumer(config);
    this.logger.log(
      `Kafka Consumer started. Topics: ${config.topics.join(', ')}`,
    );
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const value = message.value?.toString();
        if (!value) return;
        this.onMessage({ topic, message: value });
      },
    });
    this.consumer = consumer;
  }

  async stopKafkaConsumer() {
    if (this.consumer) {
      await this.consumer.stop();
      this.consumer = null;
    }
  }

  async kafkaProducer() {
    const config = { brokers: ['localhost:9092'], logLevel: 0 };
    const topic = 'test';
    const message = 'test-non';
    return this.kafkaProducerService.send(config, topic, message);
  }

  async startRabbitMQ() {
    if (this.rabbitMQConnection && this.rabbitMQChannel) return;
    const queues = ['test'];
    const { connect, channel } = await this.rabbitMQService.start(
      'amqp://localhost:5672',
      queues,
    );
    this.rabbitMQConnection = connect;
    this.rabbitMQChannel = channel;
    for (const queue of queues) {
      await this.rabbitMQChannel.consume(queue, (msg) => {
        if (!msg) return;
        const data = msg.content.toString() as string;
        this.onMessage({ topic: queue, message: data });
        this.rabbitMQChannel.ack(msg);
      });
    }
    this.logger.log(`RabbitMQ Consumer started. Topics: ${queues.join(', ')}`);
  }

  async rabbitMQProducer() {
    if (this.rabbitMQChannel) {
      return await this.rabbitMQChannel.sendToQueue(
        'test',
        Buffer.from('hi hi'),
      );
    }
  }

  async stopRabbitMQ() {
    if (this.rabbitMQConnection && this.rabbitMQChannel) {
      await this.rabbitMQService.close(
        this.rabbitMQConnection,
        this.rabbitMQChannel,
      );
      this.rabbitMQChannel = null;
      this.rabbitMQConnection = null;
    }
  }

  async setDatabaseConfigOnMemory() {
    await this.memoryCache.set('posgress', 'a');
    await this.memoryCache.set('mongo', 'a');
  }
}

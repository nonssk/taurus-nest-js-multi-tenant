import {
  HttpException,
  Inject,
  Injectable,
  OnApplicationBootstrap,
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
import { MongoService, PostgresService } from './databases/services';
import { TenantEntity, TenantRepo } from './models/pogress';

type AERROR = {
  name: string;
};

interface IProducerMessage {
  tenant: string;
  event: string;
  data: string;
}

@Injectable()
export class AppService implements OnModuleDestroy {
  private logger = new Logger(AppService.name);
  private consumer: Consumer | null = null;
  private rabbitMQConnection: amqp.Connection | null = null;
  private rabbitMQChannel: amqp.Channel | null = null;

  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly kafkaConsumerService: KafkaConsumerService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly mongoService: MongoService,
    private readonly postgresService: PostgresService,
  ) {}

  async onModuleDestroy() {
    await this.stopRabbitMQ();
    await this.stopKafkaConsumer();
  }

  async getMongo(tenant: string) {
    const TenantModel = await this.mongoService.TenantModel(tenant);
    const findAll = await TenantModel.find().exec();
    return findAll.map((m) => m.tenant);
  }

  async getPostgres(tenant: string) {
    const repoCustom = await this.postgresService.getRepo(TenantRepo, tenant);
    const repoEntity = await this.postgresService.getEntity(
      TenantEntity,
      tenant,
    );
    const findAll = await repoEntity.find({ select: ['tenant'] });
    const findNameAll = await repoCustom.getTenantNames();
    return {
      entity: findAll.map((m) => m.tenant),
      repo: findNameAll.map((m) => m.tenant),
    };
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

  async onMessage(source: KafkaCallBack) {
    try {
      const { topic, message } = source;
      const { tenant, event, data } = JSON.parse(message) as IProducerMessage;
      const log =
        '[OnMessage] Topic : ' +
        topic +
        ' Tenant : ' +
        tenant +
        ' Event : ' +
        event;
      this.logger.log(log);
      switch (event) {
        case 'LIST-TENANT-MONGO':
          const mongo = await this.getMongo(tenant);
          console.log('mongo', mongo);
          break;
        case 'LIST-TENANT-POSGRES':
          const posgres = await this.getPostgres(tenant);
          console.log('posgres', posgres);
          break;
        default:
          break;
      }
    } catch (error) {
      this.logger.error(error);
    }
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
        await this.onMessage({ topic, message: value });
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

  async kafkaProducer(tenant: string) {
    const config = { brokers: ['localhost:9092'], logLevel: 0 };
    const topic = 'test';
    const data: IProducerMessage = {
      tenant,
      event: 'LIST-TENANT-POSGRES',
      data: 'test',
    };
    const message = JSON.stringify(data);
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
      await this.rabbitMQChannel.consume(queue, async (msg) => {
        if (!msg) return;
        const data = msg.content.toString() as string;
        await this.onMessage({ topic: queue, message: data });
        this.rabbitMQChannel.ack(msg);
      });
    }
    this.logger.log(`RabbitMQ Consumer started. Topics: ${queues.join(', ')}`);
  }

  async rabbitMQProducer(tenant: string) {
    if (this.rabbitMQChannel) {
      const data: IProducerMessage = {
        tenant,
        event: 'LIST-TENANT-MONGO',
        data: 'test',
      };
      const message = JSON.stringify(data);
      return await this.rabbitMQChannel.sendToQueue(
        'test',
        Buffer.from(message),
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
}

import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { REQUEST_TENANT } from './databases';

@Controller()
export class AppController {
  constructor(
    @Inject(REQUEST_TENANT) private readonly tenant: string,
    private readonly appService: AppService,
  ) {}

  @Get('/mongo')
  mongo() {
    return this.appService.getMongo(this.tenant);
  }

  @Get('/postgres')
  getPostgres() {
    return this.appService.getPostgres(this.tenant);
  }

  @Get('/error')
  error() {
    return this.appService.error();
  }

  @Get('/http-error')
  httpError() {
    return this.appService.httpError();
  }

  @Get('/custom-error')
  customError() {
    return this.appService.customError();
  }

  @Get('/kafka-consumer-start')
  kafkaConsumerStart() {
    return this.appService.startKafkaConsumer();
  }

  @Get('/kafka-consumer-stop')
  stopKafkaConsumer() {
    return this.appService.stopKafkaConsumer();
  }

  @Get('/kafka-producer')
  kafkaProducer() {
    return this.appService.kafkaProducer();
  }

  @Get('/mq-producer')
  mqProducer() {
    return this.appService.rabbitMQProducer();
  }

  @Get('/mq-consumer-start')
  mqConsumerStart() {
    return this.appService.startRabbitMQ();
  }

  @Get('/mq-consumer-stop')
  mqConsumerStop() {
    return this.appService.stopRabbitMQ();
  }
}

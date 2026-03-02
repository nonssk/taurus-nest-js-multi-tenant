import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  async start(connection: string, queues: string[]) {
    const connect = await amqp.connect(connection);
    const channel = await connect.createChannel();
    for (const queue of queues) {
      await channel.assertQueue(queue);
    }
    return { connect, channel };
  }

  async close(connection: amqp.Connection, channel: amqp.Channel) {
    await channel.close();
    await connection.close();
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka';
import { RabbitMQModule } from './rabbitMQ';
import { CacheModule } from '@nestjs/cache-manager';
import { MongoModule, PostgresModule, TenantModule } from './databases';
import { ConfigModule } from '@nestjs/config';
import config from './configs';
import { MongoTenantType } from './models/mongo';
import { PostgresTenantType } from './models/pogress';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register(),
    KafkaModule,
    RabbitMQModule,
    MongoModule.register(config().mongoDatabaseConfig as MongoTenantType),
    PostgresModule.register(
      config().posgressDatabaseConfig as PostgresTenantType,
    ),
    TenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

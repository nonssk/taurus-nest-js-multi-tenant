import { DynamicModule, Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongoService } from './services';
import { MongoTenantType } from 'src/models/mongo';

export const MAIN_MONGO_CONFIG = 'MAIN_MONGO_CONFIG';

@Global()
@Module({ imports: [CacheModule.register()] })
export class MongoModule {
  static register(config: MongoTenantType): DynamicModule {
    return {
      module: MongoModule,
      providers: [
        {
          provide: MAIN_MONGO_CONFIG,
          useValue: config,
        },
        MongoService,
      ],
      exports: [MongoService],
    };
  }
}

import { DynamicModule, Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PostgresService } from './services';
import { PostgresTenantType } from 'src/models/pogress';

export const MAIN_POSTGRES_CONFIG = 'MAIN_POSTGRES_CONFIG';

@Global()
@Module({ imports: [CacheModule.register()] })
export class PostgresModule {
  static register(config: PostgresTenantType): DynamicModule {
    return {
      module: PostgresModule,
      providers: [
        {
          provide: MAIN_POSTGRES_CONFIG,
          useValue: config,
        },
        PostgresService,
      ],
      exports: [PostgresService],
    };
  }
}

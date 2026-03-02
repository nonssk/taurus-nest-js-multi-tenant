import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { TenantEntity, type PostgresTenantType } from 'src/models/pogress';
import { MAIN_POSTGRES_CONFIG } from '../postgres.module';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

const entities = [TenantEntity];

@Injectable()
export class PostgresService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject(MAIN_POSTGRES_CONFIG) private mainConfig: PostgresTenantType,
  ) {}

  async getDataSourceForTenant(tenant?: string) {
    if (!tenant) {
      tenant = this.mainConfig.tenant;
    }

    let config = await this.cache.get<PostgresTenantType>(
      `posgress-config:${tenant}`,
    );
    if (!config) {
      const dataSource = new DataSource({
        name: this.mainConfig.tenant,
        type: 'postgres',
        host: this.mainConfig.host,
        port: Number(this.mainConfig.port),
        username: this.mainConfig.username,
        password: this.mainConfig.password,
        database: this.mainConfig.database,
        schema: this.mainConfig.schema,
        entities,
        synchronize: false,
      });
      await dataSource.initialize();
      const record = await dataSource
        .getRepository(TenantEntity)
        .findOne({ where: { tenant: tenant } });
      if (!record) {
        throw Error('Not found config postgres');
      }
      config = {
        tenant: record.tenant,
        host: record.host,
        port: record.port,
        username: record.username,
        password: record.password,
        database: record.database,
        schema: record.schema,
      };
      await this.cache.set(`posgress-config:${tenant}`, record, 30000);
    }
    const dataSource = new DataSource({
      name: tenant,
      type: 'postgres',
      host: config.host,
      port: Number(config.port),
      username: config.username,
      password: config.password,
      database: config.database,
      schema: config.schema,
      entities,
      synchronize: false,
    });
    await dataSource.initialize();
    return dataSource;
  }

  async getRepo<T extends ObjectLiteral>(
    model: EntityTarget<T>,
    tenant?: string,
  ): Promise<Repository<T>> {
    const ds = await this.getDataSourceForTenant(tenant);
    return ds.getRepository<T>(model);
  }

  async tenantRepo(tenant?: string) {
    return this.getRepo<TenantEntity>(TenantEntity, tenant);
  }
}

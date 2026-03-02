import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { MAIN_MONGO_CONFIG } from '../mongo.module';
import { Db, MongoClient } from 'mongodb';
import type { Cache } from 'cache-manager';
import {
  Tenant,
  TenantRepo,
  TenantSchema,
} from 'src/models/mongo/tenant.model';
import type { MongoTenantType } from 'src/models/mongo/tenant.model';
import mongoose, { Connection, createConnection } from 'mongoose';

@Injectable()
export class MongoService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject(MAIN_MONGO_CONFIG) private mainConfig: MongoTenantType,
  ) {}

  async getConfigForTenant(tenant?: string): Promise<MongoTenantType> {
    if (!tenant) {
      tenant = this.mainConfig.tenant;
    }

    let config = await this.cache.get<MongoTenantType>(
      `mongo-config:${tenant}`,
    );

    if (!config) {
      const mainUri = `mongodb://${this.mainConfig.username}:${this.mainConfig.password}@${this.mainConfig.host}:${this.mainConfig.port}`;
      const mainClient = new MongoClient(mainUri);
      await mainClient.connect();
      const db = await mainClient.db(this.mainConfig.database);
      const repo = TenantRepo(db);
      const record = await repo.findOne({ tenant });
      await mainClient.close();

      if (!record) {
        throw Error('Not found config mongo');
      }

      config = record;
      await this.cache.set(`mongo-config:${tenant}`, record, 30000);
    }

    return config;
  }

  async getConnection(tenant?: string): Promise<Connection> {
    if (!tenant) {
      tenant = this.mainConfig.tenant;
    }
    const config = await this.getConfigForTenant(tenant);
    const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=admin`;
    const conn = await createConnection(uri);
    return conn;
  }

  async getModel<T>(
    modelName: string,
    schema: mongoose.Schema<T>,
    tenant?: string,
  ) {
    const conn = await this.getConnection(tenant);

    if (conn.models[modelName]) {
      return conn.models[modelName];
    }

    return conn.model(modelName, schema);
  }

  async TenantModel(tenant?: string) {
    return this.getModel<Tenant>(Tenant.name, TenantSchema, tenant);
  }
}

import { Db } from 'mongodb';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface MongoTenantType {
  tenant: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export const TenantRepo = (db: Db) => {
  return db.collection<MongoTenantType>('tenants');
};

@Schema()
export class Tenant extends Document {
  @Prop()
  tenant: string;

  @Prop()
  host: string;

  @Prop()
  port: string;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  database: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

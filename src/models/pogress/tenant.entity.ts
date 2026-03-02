import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tenants' })
export class TenantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  tenant: string;

  @Column({})
  host: string;

  @Column({})
  port: string;

  @Column({})
  username: string;

  @Column({})
  password: string;

  @Column({})
  database: string;

  @Column({})
  schema: string;
}

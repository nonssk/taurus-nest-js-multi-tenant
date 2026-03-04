import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Repository,
  DataSource,
} from 'typeorm';

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

export class TenantRepo extends Repository<TenantEntity> {
  constructor(dataSource: DataSource) {
    const manager = dataSource.manager;
    super(TenantEntity, manager, manager.queryRunner);
  }
  async getTenantNames() {
    return this.find({ select: ['tenant'] });
  }
  // * Custom query in this
}

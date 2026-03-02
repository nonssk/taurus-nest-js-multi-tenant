import { MongoTenantType } from 'src/models/mongo';
import { PostgresTenantType } from 'src/models/pogress';
import { mongoDatabaseConfig, posgressDatabaseConfig } from './database.config';

interface IConfig {
  mongoDatabaseConfig: MongoTenantType;
  posgressDatabaseConfig: PostgresTenantType;
}

export default (): Partial<IConfig> => ({
  mongoDatabaseConfig: mongoDatabaseConfig(),
  posgressDatabaseConfig: posgressDatabaseConfig(),
});

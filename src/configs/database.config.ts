export const mongoDatabaseConfig = () => {
  return {
    tenant: process.env.MONGO_TENANT || '',
    host: process.env.MONGO_HOST || '',
    port: process.env.MONGO_PORT || '',
    username: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASS || '',
    database: process.env.MONGO_DB || '',
  };
};

export const posgressDatabaseConfig = () => {
  return {
    tenant: process.env.POSTGRES_TENANT || '',
    host: process.env.POSTGRES_HOST || '',
    port: process.env.POSTGRES_PORT || '',
    username: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASS || '',
    database: process.env.POSTGRES_DB || '',
    schema: process.env.POSTGRES_SCHEMA || '',
  };
};

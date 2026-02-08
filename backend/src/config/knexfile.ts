import dotenv from 'dotenv';
import path from 'path';
import { Knex } from 'knex';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      user: 'urumi',
      password: 'urumi123',
      database: 'urumi'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.resolve(__dirname, '../migrations'),
      tableName: 'knex_migrations',
      extension: 'ts'
    }
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.resolve(__dirname, '../migrations'),
      tableName: 'knex_migrations',
      extension: 'ts'
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];

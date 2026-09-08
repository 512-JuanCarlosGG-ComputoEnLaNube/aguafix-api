import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { envs } from '../config/envs';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  database: envs.DB_NAME,
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  entities: [__dirname + '/../**/*.entity.js'],
  synchronize: false,
  migrations: [__dirname + '/migrations/*.js'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

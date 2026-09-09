import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { envs } from '../config/envs';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  database: envs.DB_NAME,
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  entities: [User, Report],
  synchronize: false,
  migrations: [__dirname + '/migrations/*.js'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  PORT: env.get('PORT').default(3000).asPortNumber(),
  DB_HOST: env.get('DB_HOST').required().asString(),
  DB_PORT: env.get('DB_PORT').required().asPortNumber(),
  DB_NAME: env.get('DB_NAME').required().asString(),
  DB_USER: env.get('DB_USER').required().asString(),
  DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
  DB_TYPE: env.get('DB_TYPE').default('postgres').asString(),
  DB_MIGRATIONS_RUN: env
    .get('DB_MIGRATIONS_RUN')
    .default('false')
    .asBoolStrict(),
  MAILER_SERVICE: env.get('MAILER_SERVICE').required().asString(),
  MAILER_USER: env.get('MAILER_USER').required().asString(),
  MAILER_PASSWORD: env.get('MAILER_PASSWORD').required().asString(),
  MAINTENANCE_EMAIL: env.get('MAINTENANCE_EMAIL').required().asString(),
  AWS_REGION: env.get('AWS_REGION').required().asString(),
  AWS_ACCESS_KEY_ID: env.get('AWS_ACCESS_KEY_ID').required().asString(),
  AWS_SECRET_ACCESS_KEY: env.get('AWS_SECRET_ACCESS_KEY').required().asString(),
  AWS_S3_BUCKET: env.get('AWS_S3_BUCKET').required().asString(),
};

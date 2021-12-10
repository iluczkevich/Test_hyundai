import { registerAs } from '@nestjs/config';
import { checkMissedVariables } from '../../utils/checkMissedVariables';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export function appConfigsFactory() {
  const port = parseInt(process.env.PORT || '');
  const host = process.env.HOST;
  const databaseUser = process.env.DATABASE_USER;
  const databasePassword = process.env.DATABASE_PASSWORD;
  const databaseHost = process.env.DATABASE_HOST;
  const databasePort = process.env.DATABASE_PORT;
  const databaseName = process.env.DATABASE_NAME;

  const missingKey = checkMissedVariables({
    port,
    host,
    databaseUser,
    databasePassword,
    databaseHost,
    databasePort,
    databaseName,
  });

  if (missingKey) {
    throw new Error(`Config key ${missingKey} is missing.`);
  }

  return registerAs('app', () => ({
    port,
    host,
    db: {
      user: databaseUser,
      password: databasePassword,
      host: databaseHost,
      port: databasePort,
      name: databaseName,
    },
  }));
}

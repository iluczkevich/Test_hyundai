import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const databaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async (): Promise<Client> => {
    try {
      const client = new Client({
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: parseInt(process.env.DATABASE_PORT || ''),
      });

      await client.connect();

      await runMigration(client);

      return client;
    } catch (error) {
      throw error;
    }
  },
};

const runMigration = async (client: Client): Promise<void> => {
  try {
    await client.query(`select * from cars;`);
  } catch (err) {
    try {
      await client.query(`
        CREATE TABLE cars(license_plate VARCHAR PRIMARY KEY);
        CREATE TABLE cars_rent(id SERIAL PRIMARY KEY, "from" DATE, "to" DATE, license_plate VARCHAR REFERENCES cars);
        INSERT INTO cars values
          ('C375KP52'),
          ('M977OX152'),
          ('E777KX777'),
          ('O001OO05'),
          ('T234YC92');
      `);
    } catch (error) {
      throw error;
    }
  }
};

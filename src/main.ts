import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('app.port') || 3000;
  const appHost = configService.get<string>('app.host') || 'localhost';

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(appPort, appHost, () => {
    console.info(`The server is listening on http://${appHost}:${appPort}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

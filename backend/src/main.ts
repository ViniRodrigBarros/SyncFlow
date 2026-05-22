import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const absUpload = join(process.cwd(), uploadDir.replace(/^\.\//, ''));
  if (!existsSync(absUpload)) {
    mkdirSync(absUpload, { recursive: true });
  }
  app.useStaticAssets(absUpload, { prefix: '/uploads/' });

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`Backend rodando em http://localhost:${port}`);
}

bootstrap();

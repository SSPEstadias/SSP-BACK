import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // activamos la validación global de todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // aqui se ignoran los campos que no están en el DTO
      forbidNonWhitelisted: true,
      // esto hace que lanze error si llegan campos no permitidos
      transform: true,
      // Convierte automáticamente tipos (ej. string "1" → number 1)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ── Swagger UI ────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('SSP — Reconecta con la Paz · API')
    .setDescription(
      '**Sistema Integral de Información del Programa Reconecta con la Paz**\n\n' +
      'Módulo de Justicia Cívica — Backend NestJS + PostgreSQL\n\n' +
      '---\n' +
      '### Cómo autenticarse\n' +
      '1. Ejecuta `POST /auth/login` con tus credenciales\n' +
      '2. Copia el `access_token` de la respuesta\n' +
      '3. Haz clic en el botón **🔒 Authorize** (arriba a la derecha)\n' +
      '4. Pega el token y haz clic en **Authorize**\n' +
      '5. Todas las peticiones siguientes lo usarán automáticamente\n\n' +
      '---\n' +
      '### Roles del sistema\n' +
      '| Rol | Responsabilidad |\n' +
      '|---|---|\n' +
      '| `Admin` | Alta de expedientes, planeación, oficios, graduación |\n' +
      '| `Psicologo` | Salud, F1 entrevista, F5 seguimiento |\n' +
      '| `TrabajoSocial` | F2 estudio socioeconómico |\n' +
      '| `Guia` | Bitácora diaria, incidencias, oficio de conclusión |',
    )
    .setVersion('1.0.0')
    .setContact(
      'DGPDPC — Secretaría de Seguridad y Protección Ciudadana',
      '',
      '',
    )
    // Botón 🔒 Authorize — pegar el JWT una sola vez para todas las rutas
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token JWT obtenido de POST /auth/login',
        in: 'header',
      },
      'JWT-Auth',
    )
    // ── Tags por módulo (orden del flujo operativo) ─────────────────
    .addTag('🔐 Auth',               'Login y gestión de sesión')
    .addTag('👤 Usuarios',           'CRUD de usuarios del sistema [Solo Admin]')
    .addTag('📋 Beneficiarios',      'Núcleo compartido Cívico + Penal (RF-001)')
    .addTag('🏃 Actividades',        'Catálogo de actividades del programa')
    .addTag('🏥 Salud',              'Perfil de salud y aptitud física (RF-005)')
    .addTag('📁 Expedientes Cívico', 'Carátula y gestión central (RF-001, RF-003)')
    .addTag('📝 F1 — Entrevista',    'Entrevista clínica psicológica (RF-006)')
    .addTag('🏠 F2 — Estudio',       'Estudio socioeconómico (RF-007)')
    .addTag('📌 F3 — Plan',          'Plan de trabajo individual — requiere F1+F2 COMPLETADOS (RF-008, RF-009)')
    .addTag('📄 F4 — Cédula',        'Cédula inicial / ficha técnica')
    .addTag('🧠 F5 — Seguimiento',   'Notas de evolución psicológica')
    .addTag('📅 Bitácora',           'Asistencia diaria y horas (RF-010, RF-011)')
    .addTag('⚠️ Incidencias',        'Faltas y regla de 3 strikes (RF-012, RF-013)')
    .addTag('📨 Oficios',            'Documentos legales generados (RF-015)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      // El token persiste aunque recargues la página del navegador
      persistAuthorization: true,
      // Expande los modelos de respuesta para ver los campos
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
      // Ordena los endpoints por método HTTP dentro de cada tag
      operationsSorter: 'method',
      // Muestra la duración de cada petición
      displayRequestDuration: true,
    },
    // Título de la pestaña del navegador
    customSiteTitle: 'SSP Reconecta — API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀 Servidor:    http://localhost:${port}`);
  console.log(`📚 Swagger UI:  http://localhost:${port}/api\n`);
}
bootstrap();
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
      '| Rol | Valor en BD | Responsabilidad principal |\n' +
      '|---|---|---|\n' +
      '| `Admin` | `admin` | Alta de expedientes, planeación, oficios, graduación |\n' +
      '| `Psicologo` | `psicologo` | Salud, F1 entrevista, F5 seguimiento |\n' +
      '| `TrabajoSocial` | `trabajo_social` | F2 estudio socioeconómico |\n' +
      '| `Guia` | `guia` | Bitácora diaria, incidencias, oficio de conclusión |\n\n' +
      '---\n' +
      '### 🗂️ Matriz de Acceso por Rol\n' +
      '| Endpoint | Admin | Psicólogo | T. Social | Guía |\n' +
      '|---|:---:|:---:|:---:|:---:|\n' +
      '| POST /users |   | ❌ | ❌ | ❌ |\n' +
      '| POST /beneficiarios |   |   |   | ❌ |\n' +
      '| POST /salud |   |   | ❌ | ❌ |\n' +
      '| POST /civico/expedientes |   | ❌ | ❌ | ❌ |\n' +
      '| POST /civico/f1 (Entrevista) |   |   | ❌ | ❌ |\n' +
      '| POST /civico/f2 (Estudio) |   | ❌ |   | ❌ |\n' +
      '| POST /civico/f3 (Plan) |   | ❌ | ❌ | ❌ |\n' +
      '| POST /civico/f4 (Cédula) |   | ❌ | ❌ | ❌ |\n' +
      '| POST /civico/f5 (Seguimiento) |   |   | ❌ | ❌ |\n' +
      '| POST /civico/bitacora |   | ❌ | ❌ |   |\n' +
      '| POST /civico/incidencias |   | ❌ | ❌ |   |\n' +
      '| POST /civico/oficios |   | ❌ | ❌ |   |\n' +
      '| GET (todos) |   |   |   |   |\n\n' +
      '---\n' +
      '### 🔄 Flujo de Pruebas Secuencial (Testing Workflow)\n\n' +
      '> **Sigue este orden**; cada fase depende de la anterior. Guarda los IDs retornados.\n\n' +
      '**Fase 0 — Crear usuarios del sistema** *(Solo Admin)*\n' +
      '```\n' +
      'POST /users  → { rol: "psicologo" }    → guarda psicologoId\n' +
      'POST /users  → { rol: "trabajo_social" }→ guarda trabajadorSocialId\n' +
      'POST /users  → { rol: "guia" }         → guarda guiaId\n' +
      '```\n\n' +
      '**Fase 1 — Registrar Beneficiario** *(cualquier rol autenticado)*\n' +
      '```\n' +
      'POST /beneficiarios  → guarda beneficiarioId (número entero)\n' +
      '```\n\n' +
      '**Fase 2 — Crear Expediente Cívico** *(Admin)*\n' +
      '```\n' +
      'POST /civico/expedientes  → guarda expedienteId (UUID)\n' +
      '```\n\n' +
      '**Fase 3 — Validación de Salud** *(Admin o Psicólogo)*\n' +
      '```\n' +
      'POST /salud  → usa beneficiarioId de Fase 1\n' +
      '```\n\n' +
      '**Fase 4 — F1 Diagnóstico Psicológico** *(Admin o Psicólogo)*\n' +
      '```\n' +
      'POST /civico/f1  → usa expedienteId + psicologoId\n' +
      '                 → guarda f1Id (UUID)\n' +
      '```\n\n' +
      '**Fase 5 — F2 Estudio Socioeconómico** *(Admin o TrabajoSocial)*\n' +
      '```\n' +
      'POST /civico/f2  → usa expedienteId + trabajadorSocialId\n' +
      '                 → guarda f2Id (UUID)\n' +
      '```\n\n' +
      '**Fase 6 — F3 Plan de Trabajo** *(Admin)* ⚠️ **Requiere F1 y F2 = COMPLETADO**\n' +
      '```\n' +
      'GET  /civico/f2/expediente/{expedienteId}/candado-f3  → verifica candado\n' +
      'POST /civico/f3  → usa expedienteId + coordinadorId\n' +
      '                 → guarda f3Id (UUID)\n' +
      '```\n\n' +
      '**Fase 7 — F4 Cédula Inicial** *(Admin)*\n' +
      '```\n' +
      'POST /civico/f4  → usa expedienteId + coordinadorId\n' +
      '                 → guarda f4Id (UUID)\n' +
      '```\n\n' +
      '**Fase 8 — Seguimiento Diario (Bitácora)** *(Admin o Guía)*\n' +
      '```\n' +
      'POST /civico/bitacora  → usa expedienteId + guiaId\n' +
      '   Escenario PRESENTE:           { asistencia: "PRESENTE", horasCubiertas: 4 }\n' +
      '   Escenario FALTA_INJUSTIFICADA: { asistencia: "FALTA_INJUSTIFICADA", horasCubiertas: 0,\n' +
      '                                   incidencia: "FALTA_INJUSTIFICADA" }\n' +
      '   ⚠️ RF-013: 3 FALTA_INJUSTIFICADA → BAJA_POR_ACUMULACION_DE_INCIDENCIAS (automático)\n' +
      '```\n\n' +
      '**Fase 9 — F5 Evolución Psicológica** *(Admin o Psicólogo)*\n' +
      '```\n' +
      'POST /civico/f5  → usa expedienteId + psicologoId + numSesion (1, 2, 3...)\n' +
      '```\n\n' +
      '**Fase 10 — Generación de Documentos PDF** *(según rol)*\n' +
      '```\n' +
      'GET /civico/documentos/oficio-incorporacion/{expedienteId}  → Admin / T.Social\n' +
      'GET /civico/documentos/f3-plan-trabajo/{expedienteId}       → Admin / T.Social / Psicólogo\n' +
      'GET /civico/documentos/f4-cedula-inicial/{expedienteId}     → Admin / T.Social / Psicólogo\n' +
      'GET /civico/documentos/nota-evolucion/{expedienteId}        → Admin / Psicólogo\n' +
      'GET /civico/documentos/oficio-conclusion/{expedienteId}     → Admin / T.Social\n' +
      '```\n\n' +
      '---\n' +
      '### ⚠️ Reglas de Negocio Importantes\n' +
      '- **RF-008:** F3 está **bloqueado** hasta que F1 y F2 tengan `estatus = COMPLETADO`\n' +
      '- **RF-013:** La 3ª `FALTA_INJUSTIFICADA` acumulativa cambia el expediente a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS` automáticamente\n' +
      '- **RF-011:** Las horas se calculan automáticamente al agregar registros en bitácora\n' +
      '- **RNF-002:** Los campos sensibles (impresión diagnóstica, examen mental) son accesibles solo para Psicólogo y Admin',
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
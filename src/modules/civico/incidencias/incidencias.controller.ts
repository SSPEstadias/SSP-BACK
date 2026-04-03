import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

@ApiTags('⚠️ Incidencias')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  // ✅ POST: Crear incidencia MANUAL (Sin bitácora - ej. no asistió a nada)
  @Post()
  @Roles('Admin', 'Guia')
  @ApiOperation({
    summary: 'Crear incidencia manual (desacoplada de bitácora) — RF-012, RF-013',
    description:
      'Registra una incidencia **independiente** de la bitácora diaria. ' +
      'Úsala cuando la incidencia ocurre fuera de una actividad programada. ' +
      '⚠️ **RF-013:** Los tipos acumulativos (`esAcumulativa: true`) cuentan para el límite de 3 strikes. ' +
      'La **3ª incidencia acumulativa** desencadena automáticamente el cambio a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`. ' +
      '\n\n**Tipos de incidencia:**\n' +
      '- `FALTA_INJUSTIFICADA` — Acumulativa por defecto\n' +
      '- `RETARDO` — Acumulativa, llegar tarde sin justificación\n' +
      '- `CONDUCTA_INAPROPIADA` — Acumulativa, comportamiento inadecuado\n' +
      '- `INCUMPLIMIENTO_TAREA` — Acumulativa, no completar asignaciones\n' +
      '- `INASISTENCIA_JUSTIFICADA` — NO acumulativa\n' +
      '- `VISITA_DOMICILIARIA` — Registro informativo\n' +
      '- `RETIRO_ANTICIPADO` — Acumulativa, se retiró antes de completar\n' +
      '- `CONVERSATORIO` — Registro informativo de seguimiento',
  })
  @ApiBody({
    description: 'Datos de la incidencia. `expedienteId`, `guiaId`, `tipo` y `fechaIncidencia` son obligatorios.',
    examples: {
      'Escenario 1 — Falta injustificada (strike 1)': {
        summary: '⚠️ 1ª falta injustificada — esAcumulativa: true',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          guiaId: 4,
          tipo: 'FALTA_INJUSTIFICADA',
          fechaIncidencia: '2025-04-14',
          descripcionHechos: 'No se presentó a ninguna actividad programada sin aviso previo ni justificación.',
          esAcumulativa: true,
          estatusResolucion: 'PENDIENTE',
        },
      },
      'Escenario 2 — Retardo injustificado (strike 2)': {
        summary: '⚠️ 2ª incidencia acumulativa (retardo grave)',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          guiaId: 4,
          tipo: 'RETARDO',
          fechaIncidencia: '2025-04-21',
          descripcionHechos: 'Llegó 2 horas tarde sin comunicación previa. Alteró la dinámica del grupo.',
          esAcumulativa: true,
          estatusResolucion: 'PENDIENTE',
        },
      },
      'Escenario 3 — 3ª falta (¡BAJA AUTOMÁTICA!)': {
        summary: '🔴 3ª incidencia acumulativa → BAJA_POR_ACUMULACION_DE_INCIDENCIAS (RF-013)',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          guiaId: 4,
          tipo: 'FALTA_INJUSTIFICADA',
          fechaIncidencia: '2025-04-28',
          descripcionHechos: 'No se presentó por tercera ocasión sin justificación. Sistema aplicará baja automática.',
          esAcumulativa: true,
          estatusResolucion: 'PENDIENTE',
        },
      },
      'Escenario 4 — Conducta inapropiada': {
        summary: 'Incidencia por comportamiento inadecuado',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          guiaId: 4,
          tipo: 'CONDUCTA_INAPROPIADA',
          fechaIncidencia: '2025-04-16',
          descripcionHechos: 'Utilizó lenguaje ofensivo hacia el personal del programa y se negó a cooperar en la actividad.',
          esAcumulativa: true,
          estatusResolucion: 'PENDIENTE',
        },
      },
      'Escenario 5 — Inasistencia justificada (NO acumulativa)': {
        summary: 'Falta con justificación válida — no suma al contador',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          guiaId: 4,
          tipo: 'INASISTENCIA_JUSTIFICADA',
          fechaIncidencia: '2025-04-17',
          descripcionHechos: 'Presentó constancia médica del IMSS. Internado 1 día por apendicitis.',
          esAcumulativa: false,
          estatusResolucion: 'RESUELTA',
          numOficioNotificacion: null,
        },
      },
      'Escenario 6 — Visita domiciliaria (informativa)': {
        summary: 'Registro de visita domiciliaria del Trabajo Social',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          guiaId: 4,
          tipo: 'VISITA_DOMICILIARIA',
          fechaIncidencia: '2025-04-22',
          descripcionHechos: 'Se realizó visita domiciliaria de seguimiento. Familia reporta mejoras en conducta.',
          esAcumulativa: false,
          estatusResolucion: 'RESUELTA',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Incidencia creada. Si es la 3ª acumulativa, el expediente cambia automáticamente a BAJA_POR_ACUMULACION_DE_INCIDENCIAS.',
    schema: {
      type: 'object',
      properties: {
        idUUID: { type: 'string', format: 'uuid', example: 'a7b8c9d0-e1f2-3456-0123-567890123456' },
        expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
        tipo: { type: 'string', example: 'FALTA_INJUSTIFICADA' },
        fechaIncidencia: { type: 'string', format: 'date', example: '2025-04-14' },
        esAcumulativa: { type: 'boolean', example: true },
        estatusResolucion: { type: 'string', example: 'PENDIENTE', enum: ['PENDIENTE', 'RESUELTA', 'DERIVO_EN_BAJA'] },
      },
    },
  })
  create(@Body() dto: CreateIncidenciaDto) {
    return this.service.create(dto);
  }

  // GET: Listar incidencias de un expediente
  @Get('expediente/:expedienteId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Listar todas las incidencias de un expediente' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
  @ApiResponse({ status: 200, description: 'Lista de incidencias ordenadas por fecha' })
  findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.findByExpediente(expedienteId);
  }

  // GET: Contar strikes/incidencias acumulativas
  @Get('expediente/:expedienteId/strikes')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({
    summary: 'Contar strikes acumulativos del expediente (RF-013)',
    description: 'Cuenta las incidencias con `esAcumulativa = true`. Al llegar a 3, se activa la baja automática.',
  })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
  @ApiResponse({
    status: 200,
    description: 'Conteo de strikes acumulativos',
    schema: {
      type: 'object',
      properties: {
        strikes: { type: 'number', example: 2, description: 'Número de incidencias acumulativas activas' },
        limite: { type: 'number', example: 3 },
        enRiesgo: { type: 'boolean', example: true, description: 'true cuando strikes >= 2' },
        bajaActivada: { type: 'boolean', example: false, description: 'true cuando strikes >= 3' },
      },
    },
  })
  contarStrikes(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.contarStrikes(expedienteId);
  }

  // GET: Obtener una incidencia específica
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Obtener una incidencia por UUID' })
  @ApiParam({ name: 'id', description: 'UUID del registro de incidencia', example: 'a7b8c9d0-e1f2-3456-0123-567890123456' })
  @ApiResponse({ status: 200, description: 'Incidencia encontrada' })
  @ApiResponse({ status: 404, description: 'Incidencia no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // PATCH: Resolver incidencia (cambiar estatus)
  @Patch(':id/resolver')
  @Roles('Admin', 'Guia')
  @ApiOperation({
    summary: 'Resolver una incidencia (cambiar estatus a RESUELTA)',
    description: 'Marca la incidencia como resuelta. Opcionalmente registra el número de oficio de notificación al juzgado.',
  })
  @ApiParam({ name: 'id', description: 'UUID del registro de incidencia', example: 'a7b8c9d0-e1f2-3456-0123-567890123456' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        numOficioNotificacion: {
          type: 'string',
          nullable: true,
          example: 'OFC-2026-089',
          description: 'Número de oficio enviado al juzgado (opcional)',
        },
      },
    },
    examples: {
      'Resolver con oficio': {
        value: { numOficioNotificacion: 'OFC-2026-089' },
      },
      'Resolver sin oficio': {
        value: { numOficioNotificacion: null },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Incidencia resuelta',
    schema: {
      type: 'object',
      properties: {
        idUUID: { type: 'string', format: 'uuid' },
        estatusResolucion: { type: 'string', example: 'RESUELTA', enum: ['PENDIENTE', 'RESUELTA', 'DERIVO_EN_BAJA'] },
        numOficioNotificacion: { type: 'string', nullable: true, example: 'OFC-2026-089' },
      },
    },
  })
  resolver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('numOficioNotificacion') numOficio?: string,
  ) {
    return this.service.resolver(id, numOficio);
  }
}
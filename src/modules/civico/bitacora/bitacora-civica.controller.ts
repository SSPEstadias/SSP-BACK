import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    ParseUUIDPipe,
    UseGuards,
  } from '@nestjs/common';
  import { BitacoraCivicaService } from './bitacora-civica.service';
  import { CreateBitacoraCivicaDto } from './dto/create-bitacora-civica.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

  @ApiTags('📅 Bitácora')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/bitacora')
  export class BitacoraCivicaController {
    constructor(private readonly service: BitacoraCivicaService) {}
  
    // POST /civico/bitacora
    @Post()
    @Roles('Admin', 'Guia')
    @ApiOperation({
      summary: '(Fase 8) Registrar asistencia en bitácora — RF-011, RF-012, RF-013',
      description:
        'Registra la asistencia diaria del beneficiario. ' +
        'El sistema calcula automáticamente las horas acumuladas (RF-011). ' +
        '⚠️ **RF-013:** Si el campo `asistencia = "FALTA_INJUSTIFICADA"` es la **3ª falta acumulativa**, ' +
        'el expediente cambia automáticamente a `BAJA_POR_ACUMULACION_DE_INCIDENCIAS`. ' +
        'Los valores válidos de `asistencia`: `PRESENTE`, `FALTA_JUSTIFICADA`, `FALTA_INJUSTIFICADA`, `PRESENTE_PARCIAL`. ' +
        'Los valores válidos de `incidencia`: `FALTA_INJUSTIFICADA`, `RETARDO`, `CONDUCTA_INAPROPIADA`, ' +
        '`INCUMPLIMIENTO_TAREA`, `INASISTENCIA_JUSTIFICADA`, `VISITA_DOMICILIARIA`, `RETIRO_ANTICIPADO`, `CONVERSATORIO`.',
    })
    @ApiBody({
      description: 'Datos del registro de asistencia. `expedienteId`, `guiaId`, `fechaActividad`, `horasCubiertas` y `asistencia` son obligatorios. ⚠️ `guiaId` debe corresponder a un usuario con `rol = "guia"` — se rechazará cualquier otro rol.',
      examples: {
        'Escenario 1 — Asistencia completa (happy path)': {
          summary: 'Beneficiario presente, sin incidencias',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            guiaId: 4,
            fechaActividad: '2025-04-07',
            actividadId: 1,
            horasCubiertas: 4.5,
            asistencia: 'PRESENTE',
            sede: 'Centro Comunitario Oriente',
            observaciones: 'Participó activamente en el Tequio por la seguridad. Actitud positiva.',
          },
        },
        'Escenario 2 — Presente parcial con retardo': {
          summary: 'Beneficiario llegó tarde (incidencia: RETARDO)',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            guiaId: 4,
            fechaActividad: '2025-04-08',
            actividadId: 1,
            horasCubiertas: 3.0,
            asistencia: 'PRESENTE_PARCIAL',
            sede: 'Parque Lineal Norte',
            incidencia: 'RETARDO',
            detalleIncidencia: 'Llegó 1 hora tarde a la actividad de reforestación sin justificación previa.',
            observaciones: 'Se le hizo un llamado de atención verbal.',
          },
        },
        'Escenario 3 — Falta injustificada (¡cuenta como strike!)': {
          summary: '⚠️ FALTA_INJUSTIFICADA — suma al conteo de strikes (RF-013)',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            guiaId: 4,
            fechaActividad: '2025-04-09',
            actividadId: 1,
            horasCubiertas: 0,
            asistencia: 'FALTA_INJUSTIFICADA',
            incidencia: 'FALTA_INJUSTIFICADA',
            detalleIncidencia: 'No se presentó a la actividad programada sin aviso previo ni justificación.',
            observaciones: '1ª falta injustificada registrada. Se notificará al juzgado si alcanza 3.',
          },
        },
        'Escenario 4 — Falta justificada (NO suma strike)': {
          summary: 'Falta con justificación médica o personal válida',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            guiaId: 4,
            fechaActividad: '2025-04-10',
            actividadId: 1,
            horasCubiertas: 0,
            asistencia: 'FALTA_JUSTIFICADA',
            incidencia: 'INASISTENCIA_JUSTIFICADA',
            detalleIncidencia: 'Presentó constancia médica del IMSS por infección gastrointestinal.',
            observaciones: 'Falta justificada. No se contabiliza como strike. Se reagendará la actividad.',
          },
        },
        'Escenario 5 — Conducta inapropiada': {
          summary: 'Beneficiario presente pero con conducta inapropiada',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            guiaId: 4,
            fechaActividad: '2025-04-11',
            actividadId: 3,
            horasCubiertas: 2.0,
            asistencia: 'PRESENTE_PARCIAL',
            sede: 'Plaza Cívica Municipal',
            incidencia: 'CONDUCTA_INAPROPIADA',
            detalleIncidencia: 'Usó lenguaje ofensivo hacia compañeros de actividad. Se retiró antes de completar.',
            observaciones: 'Se reportó el incidente. Se recomienda sesión de seguimiento con el psicólogo.',
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'Registro de asistencia creado. Las horas se acumulan automáticamente en el expediente (RF-011).',
      schema: {
        type: 'object',
        properties: {
          idUUID: { type: 'string', format: 'uuid', example: 'f6a7b8c9-d0e1-2345-f012-456789012345' },
          expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
          guiaId: { type: 'number', example: 4 },
          fechaActividad: { type: 'string', format: 'date', example: '2025-04-07' },
          horasCubiertas: { type: 'number', example: 4.5 },
          asistencia: { type: 'string', example: 'PRESENTE', enum: ['PRESENTE', 'FALTA_JUSTIFICADA', 'FALTA_INJUSTIFICADA', 'PRESENTE_PARCIAL'] },
          incidencia: { type: 'string', nullable: true, example: null, enum: ['FALTA_INJUSTIFICADA', 'RETARDO', 'CONDUCTA_INAPROPIADA', 'INCUMPLIMIENTO_TAREA', 'INASISTENCIA_JUSTIFICADA', 'VISITA_DOMICILIARIA', 'RETIRO_ANTICIPADO', 'CONVERSATORIO'] },
          detalleIncidencia: { type: 'string', nullable: true, example: null },
          sede: { type: 'string', nullable: true, example: 'Centro Comunitario Oriente' },
          observaciones: { type: 'string', nullable: true, example: 'Participó activamente.' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-04-07T08:00:00.000Z' },
        },
      },
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos (horasCubiertas > 8, asistencia no válida, etc.)' })
    create(@Body() dto: CreateBitacoraCivicaDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    @ApiOperation({ summary: 'Listar todos los registros de bitácora de un expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({ status: 200, description: 'Lista de registros de asistencia ordenados por fecha' })
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId/horas
    @Get('expediente/:expedienteId/horas')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    @ApiOperation({
      summary: 'Calcular horas acumuladas de un expediente (RF-011)',
      description: 'Suma las horas registradas en la bitácora. Útil para verificar el progreso respecto a `horasSentencia`.',
    })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({
      status: 200,
      description: 'Total de horas acumuladas',
      schema: {
        type: 'object',
        properties: {
          horasAcumuladas: { type: 'number', example: 36.5 },
          horasSentencia: { type: 'number', example: 48 },
          porcentajeAvance: { type: 'number', example: 76.04 },
        },
      },
    })
    calcularHoras(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.calcularHorasAcumuladas(expedienteId);
    }
  
    // GET /civico/bitacora/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    @ApiOperation({ summary: 'Obtener un registro de bitácora por UUID' })
    @ApiParam({ name: 'id', description: 'UUID del registro de bitácora', example: 'f6a7b8c9-d0e1-2345-f012-456789012345' })
    @ApiResponse({ status: 200, description: 'Registro de asistencia encontrado' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // DELETE /civico/bitacora/:id
    @Delete(':id')
    @Roles('Admin')
    @ApiOperation({ summary: 'Eliminar un registro de bitácora [Solo Admin]' })
    @ApiParam({ name: 'id', description: 'UUID del registro de bitácora', example: 'f6a7b8c9-d0e1-2345-f012-456789012345' })
    @ApiResponse({ status: 200, description: 'Registro eliminado. Las horas acumuladas se recalculan automáticamente.' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.remove(id);
    }
  }
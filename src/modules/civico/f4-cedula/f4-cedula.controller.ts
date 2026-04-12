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
  import { F4CedulaService } from './f4-cedula.service';
  import { CreateCedulaInicialDto } from './dto/create-cedula-inicial.dto';
  import { UpdateCedulaInicialDto } from './dto/update-cedula-inicial.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { FormStatusEnum } from '../enums/civico.enums';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

  @ApiTags('📄 F4 — Cédula')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f4')
  export class F4CedulaController {
    constructor(private readonly service: F4CedulaService) {}
  
    // POST /civico/f4
    @Post()
    @Roles('Admin', 'Coordinador')
    @ApiOperation({
      summary: '(Fase 7) Crear Cédula Inicial de Seguimiento (F4) [Solo Admin] — RF-009',
      description:
        'Genera la ficha técnica de seguimiento inicial del beneficiario. ' +
        'Este documento es una versión simplificada para el seguimiento de ingreso, ' +
        'complementando al Plan de Trabajo (F3).\n\n' +
        '---\n\n' +
        '### Campo `seguimientoActividades` — ⚠️ Claves obligatorias\n\n' +
        'Este campo solo reconoce las siguientes claves para la tabla del PDF:\n\n' +
        '`EDUCATIVA` · `LABORAL` · `FAMILIAR` · `DEPORTIVO` · `CULTURAL`\n\n' +
        'A diferencia del F3, aquí cada clave acepta un **texto libre** que aparecerá en la columna "OBSERVACIONES" del PDF. ' +
        'Se recomienda consolidar aquí el estatus y avance de manera resumida.\n\n' +
        '---\n\n' +
        'Usa `GET /civico/documentos/f4-cedula-inicial/{expedienteId}` para generar el PDF oficial.',
    })
    @ApiBody({
      description:
        '⚠️ El campo `seguimientoActividades` DEBE usar EXACTAMENTE las claves: ' +
        'EDUCATIVA, LABORAL, FAMILIAR, DEPORTIVO, CULTURAL. ' +
        'El valor de cada clave es texto libre que se mostrará como observación en el PDF. ' +
        'Usar claves diferentes provocará que la tabla "Proceso de Seguimiento" quede vacía.',
      examples: {
        'Cédula Completa (Yahir Leon — todas las categorías)': {
          summary: '(Fase 7) Cédula con proceso de ingreso y las 5 categorías de seguimiento',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            coordinadorId: 1,
            procesoIngreso: 'El beneficiario se presenta en tiempo y forma. Se le explica el programa y firma carta de compromiso. Ingresa en condiciones adecuadas para el servicio.',
            seguimientoActividades: {
              EDUCATIVA:  'Manual Fénix — 0/8 sesiones completadas. Pendiente inicio de actividades educativas.',
              LABORAL:    'Pendiente asignación de actividad laboral. Se explorará taller de habilidades para el empleo.',
              FAMILIAR:   'Red de apoyo familiar identificada — madre y padre presentes. Dinámica familiar estable.',
              DEPORTIVO:  'Participación en actividades físicas — sin restricciones médicas.',
              CULTURAL:   'Asistencia a taller de pintura comunitaria programada para la siguiente semana.',
            },
            estatusF4: 'COMPLETADO',
          },
        },
        'Cédula Mínima (solo proceso de ingreso)': {
          summary: 'Cédula básica sin detalle de seguimiento por categorías',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            coordinadorId: 1,
            procesoIngreso: 'Beneficiario recibido. Se entrega reglamento del programa.',
            estatusF4: 'EN_PROCESO',
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'F4 creado. Usa `GET /civico/documentos/f4-cedula-inicial/{expedienteId}` para generar el PDF.',
      schema: {
        type: 'object',
        properties: {
          idUUID: { type: 'string', format: 'uuid', example: 'd4e5f6a7-b8c9-0123-def0-234567890123' },
          expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
          coordinadorId: { type: 'number', example: 1 },
          estatusF4: { type: 'string', example: 'COMPLETADO', enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'] },
        },
      },
    })
    @ApiResponse({ status: 409, description: 'Ya existe un F4 para este expediente (relación 1:1)' })
    create(@Body() dto: CreateCedulaInicialDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f4/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia', 'Coordinador')
    @ApiOperation({ summary: 'Obtener F4 por expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({ status: 200, description: 'Cédula inicial del expediente' })
    @ApiResponse({ status: 404, description: 'No existe F4 para ese expediente' })
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f4/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia', 'Coordinador')
    @ApiOperation({ summary: 'Obtener F4 por UUID del registro' })
    @ApiParam({ name: 'id', description: 'UUID del registro F4' })
    @ApiResponse({ status: 200, description: 'Cédula inicial encontrada' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f4/:id
    @Patch(':id')
    @Roles('Admin', 'Coordinador')
    @ApiOperation({ summary: 'Actualizar datos de la cédula inicial F4 [Solo Admin]' })
    @ApiParam({ name: 'id', description: 'UUID del registro F4' })
    @ApiBody({
      description:
        '⚠️ Si envías `seguimientoActividades`, usa ÚNICAMENTE las claves válidas: ' +
        'EDUCATIVA, LABORAL, FAMILIAR, DEPORTIVO, CULTURAL. ' +
        'El valor de cada clave es texto libre (observaciones) que aparecerá en el PDF.',
      examples: {
        'Actualizar seguimiento de actividades': {
          value: {
            seguimientoActividades: {
              EDUCATIVA:  'Manual Fénix — 4/8 sesiones completadas. Avance satisfactorio.',
              LABORAL:    'Inscrito en taller de habilidades laborales. Asistencia regular.',
              FAMILIAR:   'Se realizó visita domiciliaria — situación familiar estable.',
              DEPORTIVO:  'Participó en 2 jornadas deportivas comunitarias.',
              CULTURAL:   'Completó taller de pintura — entrega de constancia pendiente.',
            },
          },
        },
        'Actualizar proceso de ingreso': {
          value: {
            procesoIngreso: 'Se actualizan datos de ingreso tras visita domiciliaria del Trabajo Social.',
          },
        },
      },
    })
    @ApiResponse({ status: 200, description: 'F4 actualizado' })
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateCedulaInicialDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/f4/:id/estatus
    @Patch(':id/estatus')
  @Roles('Admin', 'Coordinador')
  @ApiOperation({ summary: 'Cambiar estatus del F4 [Solo Admin]' })
  @ApiParam({ name: 'id', description: 'UUID del registro F4' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estatusF4: {
          type: 'string',
          enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'],
          example: 'COMPLETADO',
        },
      },
      required: ['estatusF4'],
    },
  })
  @ApiResponse({ status: 200, description: 'Estatus de F4 actualizado' })
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatusF4') estatusF4: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatusF4);
  }
}
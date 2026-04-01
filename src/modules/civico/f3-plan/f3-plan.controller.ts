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
  import { F3PlanService } from './f3-plan.service';
  import { CreatePlanTrabajoDto } from './dto/create-plan-trabajo.dto';
  import { UpdatePlanTrabajoDto } from './dto/update-plan-trabajo.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { FormStatusEnum } from '../enums/civico.enums';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

  @ApiTags('📌 F3 — Plan')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f3')
  export class F3PlanController {
    constructor(private readonly service: F3PlanService) {}
  
    // POST /civico/f3  — falla si F1 o F2 no están COMPLETADOS (RF-008)
    @Post()
    @Roles('Admin')
    @ApiOperation({
      summary: '(Fase 6) Crear Plan de Trabajo (F3) [Solo Admin] — RF-006, RF-008',
      description:
        '⚠️ **REQUIERE que F1 y F2 estén en estatus `COMPLETADO`** antes de crear este formulario (RF-008). ' +
        'Verifica con `GET /civico/f2/expediente/{id}/candado-f3` primero. ' +
        'El campo `actividadesPlan` es un objeto JSONB con las categorías de actividades asignadas al beneficiario. ' +
        'Genera el documento PDF con `GET /civico/documentos/f3-plan-trabajo/{expedienteId}`.',
    })
    @ApiBody({
      description: 'Plan de trabajo individual. `actividadesPlan` es obligatorio y debe incluir las categorías del programa.',
      examples: {
        'Plan Completo (Yahir Leon — caso típico)': {
          summary: '(Fase 6) Plan con múltiples categorías de actividad',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            coordinadorId: 1,
            fechaInicioEstimada: '2025-04-01',
            fechaTerminoEstimada: '2025-06-01',
            diasAsignados: 'Lunes, Miércoles y Viernes de 08:00 a 12:00',
            metasPrograma: 'Cumplir 48 horas de servicio comunitario y concluir el Taller de Valores.',
            proyectoVidaF3: {
              personal: 'Retomar y concluir estudios universitarios de Ingeniería',
              familiar: 'Fortalecer la relación con su familia de origen',
              social: 'Participar activamente en actividades comunitarias de su colonia',
            },
            actividadesPlan: {
              TRABAJO_COMUNITARIO: { objetivo: 'Participar en 3 tequios de rescate de espacios públicos', idActividad: 1, estatus: 'PENDIENTE' },
              EDUCACION_PARA_LA_VIDA: { objetivo: 'Acreditar el Manual Fénix (8 sesiones)', idActividad: 5, estatus: 'PENDIENTE' },
              BRIGADEO_ECOLOGICO: { objetivo: 'Participar en 2 jornadas de reforestación', idActividad: 3, estatus: 'PENDIENTE' },
              PARTICIPACION_CIUDADANA: { objetivo: 'Asistir al taller de mediación comunitaria', idActividad: 7, estatus: 'PENDIENTE' },
            },
            observacionesPlan: 'Beneficiario comprometido con el programa. Se asignan actividades variadas para cubrir las 48 horas requeridas.',
            estatusF3: 'COMPLETADO',
          },
        },
        'Plan Mínimo (solo actividad principal)': {
          summary: 'Plan con una sola categoría de actividad',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            coordinadorId: 1,
            fechaInicioEstimada: '2025-04-01',
            fechaTerminoEstimada: '2025-05-01',
            actividadesPlan: {
              TRABAJO_COMUNITARIO: { objetivo: 'Limpieza de espacios públicos en Parque Bicentenario', idActividad: 1, estatus: 'PENDIENTE' },
            },
            estatusF3: 'COMPLETADO',
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'F3 creado. Usa `GET /civico/documentos/f3-plan-trabajo/{expedienteId}` para generar el PDF.',
      schema: {
        type: 'object',
        properties: {
          idUUID: { type: 'string', format: 'uuid', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
          expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
          coordinadorId: { type: 'number', example: 1 },
          estatusF3: { type: 'string', example: 'COMPLETADO', enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'] },
        },
      },
    })
    @ApiResponse({ status: 403, description: 'RF-008: F1 y/o F2 no están COMPLETADOS — no se puede crear el F3' })
    @ApiResponse({ status: 409, description: 'Ya existe un F3 para este expediente (relación 1:1)' })
    create(@Body() dto: CreatePlanTrabajoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f3/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    @ApiOperation({ summary: 'Obtener F3 por expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({ status: 200, description: 'Plan de trabajo del expediente' })
    @ApiResponse({ status: 404, description: 'No existe F3 para ese expediente' })
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f3/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    @ApiOperation({ summary: 'Obtener F3 por UUID del registro' })
    @ApiParam({ name: 'id', description: 'UUID del registro F3' })
    @ApiResponse({ status: 200, description: 'Plan de trabajo encontrado' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f3/:id
    @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar datos del plan de trabajo F3 [Solo Admin]' })
  @ApiParam({ name: 'id', description: 'UUID del registro F3' })
  @ApiBody({
    type: UpdatePlanTrabajoDto,
    examples: {
      'Actualizar actividades y observaciones': {
        value: {
          actividadesPlan: {
            TRABAJO_COMUNITARIO: { objetivo: 'Tequio en Parque España', idActividad: 2, estatus: 'EN_PROCESO' },
            EDUCACION_PARA_LA_VIDA: { objetivo: 'Manual Fénix — sesiones 1-4 completadas', idActividad: 5, estatus: 'EN_PROCESO' },
          },
          observacionesPlan: 'Se ajustan actividades según disponibilidad del beneficiario.',
        },
      },
      'Actualizar fechas del plan': {
        value: {
          fechaTerminoEstimada: '2025-07-01',
          diasAsignados: 'Martes y Jueves de 09:00 a 13:00',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'F3 actualizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanTrabajoDto,
  ) {
    return this.service.update(id, dto);
  }
  
    // PATCH /civico/f3/:id/estatus
    @Patch(':id/estatus')
  @Roles('Admin')
  @ApiOperation({ summary: 'Cambiar estatus del F3 [Solo Admin]' })
  @ApiParam({ name: 'id', description: 'UUID del registro F3' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estatusF3: {
          type: 'string',
          enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'],
          example: 'COMPLETADO',
        },
      },
      required: ['estatusF3'],
    },
  })
  @ApiResponse({ status: 200, description: 'Estatus de F3 actualizado' })
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatusF3') estatusF3: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatusF3);
  }
}
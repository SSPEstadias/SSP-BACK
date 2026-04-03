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
        'Verifica con `GET /civico/f2/expediente/{id}/candado-f3` primero.\n\n' +
        '---\n\n' +
        '### Campo `actividadesPlan` — ⚠️ Claves obligatorias\n\n' +
        'Este campo es un objeto JSONB que **DEBE usar exactamente las siguientes claves** para que la tabla ' +
        '"Proceso de Seguimiento de Actividades del Programa" del PDF se genere correctamente:\n\n' +
        '`EDUCATIVA` · `PSICOSOCIAL` · `PSICOLOGICA` · `ADICCIONES` · `FAMILIAR` · `LABORAL` · `DEPORTIVA` · `CULTURAL`\n\n' +
        'Cada clave debe tener la forma: `{ "estatus": "PENDIENTE|EN_PROCESO|COMPLETADO", "objetivo": "...", "cumplimiento": "..." }`\n\n' +
        'Si se envía cualquier otra clave (por ejemplo `TRABAJO_COMUNITARIO`), los datos **no aparecerán** en el PDF.\n\n' +
        '---\n\n' +
        'Genera el documento PDF con `GET /civico/documentos/f3-plan-trabajo/{expedienteId}`.',
    })
    @ApiBody({
      description:
        '⚠️ El campo `actividadesPlan` DEBE usar EXACTAMENTE las claves: ' +
        'EDUCATIVA, PSICOSOCIAL, PSICOLOGICA, ADICCIONES, FAMILIAR, LABORAL, DEPORTIVA, CULTURAL. ' +
        'Cada categoría acepta: { estatus, objetivo, cumplimiento }. ' +
        'Usar claves diferentes provocará que la tabla del PDF quede vacía.',
      examples: {
        'Plan Completo (Yahir Leon — todas las categorías)': {
          summary: '(Fase 6) Plan con las 8 categorías de actividad del programa',
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
              EDUCATIVA:   { estatus: 'PENDIENTE',    objetivo: 'Acreditar el Manual Fénix (8 sesiones)',                  cumplimiento: '', vinculacion: 'CEPRESO / SSP',   temporalidad: 'Abril–Mayo 2025',  seguimiento: '' },
              PSICOSOCIAL: { estatus: 'PENDIENTE',    objetivo: 'Fortalecer red de apoyo familiar y comunitario',          cumplimiento: '', vinculacion: 'DIF Municipal',      temporalidad: 'Abril–Junio 2025', seguimiento: '' },
              PSICOLOGICA: { estatus: 'PENDIENTE',    objetivo: 'Asistir a 4 sesiones de orientación psicológica',        cumplimiento: '', vinculacion: 'Área de Psicología', temporalidad: 'Mensual',          seguimiento: '' },
              ADICCIONES:  { estatus: 'PENDIENTE',    objetivo: 'Participar en taller de prevención de adicciones',       cumplimiento: '', vinculacion: 'CIJ / CAPA',        temporalidad: 'Mayo 2025',        seguimiento: '' },
              FAMILIAR:    { estatus: 'PENDIENTE',    objetivo: 'Asistir a talleres de dinámica familiar',                cumplimiento: '', vinculacion: 'DIF / Familia',      temporalidad: 'Abril–Mayo 2025',  seguimiento: '' },
              LABORAL:     { estatus: 'PENDIENTE',    objetivo: 'Participar en curso de habilidades para el empleo',      cumplimiento: '', vinculacion: 'STYO / INAEBA',     temporalidad: 'Mayo 2025',        seguimiento: '' },
              DEPORTIVA:   { estatus: 'PENDIENTE',    objetivo: 'Participar en 3 tequios de rescate de espacios públicos', cumplimiento: '', vinculacion: 'Ayuntamiento',      temporalidad: 'Semanal',          seguimiento: '' },
              CULTURAL:    { estatus: 'PENDIENTE',    objetivo: 'Participar en 2 jornadas de reforestación ecológica',    cumplimiento: '', vinculacion: 'SEMARNAT',          temporalidad: 'Bimestral',        seguimiento: '' },
            },
            observacionesPlan: 'Beneficiario comprometido con el programa. Se asignan actividades variadas para cubrir las 48 horas requeridas.',
            estatusF3: 'COMPLETADO',
          },
        },
        'Plan Mínimo (categorías principales)': {
          summary: 'Plan con las categorías más comunes',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            coordinadorId: 1,
            fechaInicioEstimada: '2025-04-01',
            fechaTerminoEstimada: '2025-05-01',
            actividadesPlan: {
              EDUCATIVA:   { estatus: 'PENDIENTE', objetivo: 'Acreditar taller de valores y convivencia', cumplimiento: '', vinculacion: 'CEPRESO', temporalidad: 'Mensual', seguimiento: '' },
              PSICOSOCIAL: { estatus: 'PENDIENTE', objetivo: 'Fortalecer vínculos con red de apoyo',      cumplimiento: '', vinculacion: 'DIF',     temporalidad: 'Mensual', seguimiento: '' },
              LABORAL:     { estatus: 'PENDIENTE', objetivo: 'Participar en taller de habilidades laborales', cumplimiento: '', vinculacion: 'STYO', temporalidad: 'Mayo 2025', seguimiento: '' },
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
    description:
      '⚠️ Si envías `actividadesPlan`, usa ÚNICAMENTE las claves válidas: ' +
      'EDUCATIVA, PSICOSOCIAL, PSICOLOGICA, ADICCIONES, FAMILIAR, LABORAL, DEPORTIVA, CULTURAL. ' +
      'Cada categoría acepta: { estatus, objetivo, cumplimiento, vinculacion, temporalidad, seguimiento }.',
    examples: {
      'Actualizar actividades y observaciones': {
        value: {
          actividadesPlan: {
            EDUCATIVA:   { estatus: 'EN_PROCESO', objetivo: 'Manual Fénix — sesiones 1-4 completadas', cumplimiento: 'Sesiones 1 a 4 acreditadas', vinculacion: 'CEPRESO / SSP', temporalidad: 'Abril–Mayo 2025', seguimiento: 'En seguimiento semanal' },
            PSICOSOCIAL: { estatus: 'EN_PROCESO', objetivo: 'Fortalecer red de apoyo familiar',         cumplimiento: '2 reuniones familiares realizadas', vinculacion: 'DIF Municipal', temporalidad: 'Mensual', seguimiento: '' },
          },
          observacionesPlan: 'Se ajustan actividades según disponibilidad del beneficiario.',
        },
      },
      'Marcar actividades como completadas': {
        value: {
          actividadesPlan: {
            EDUCATIVA:   { estatus: 'COMPLETADO', objetivo: 'Acreditar el Manual Fénix (8 sesiones)', cumplimiento: '8/8 sesiones acreditadas', vinculacion: 'CEPRESO / SSP', temporalidad: 'Abril–Mayo 2025', seguimiento: 'Completado' },
            DEPORTIVA:   { estatus: 'COMPLETADO', objetivo: 'Participar en 3 tequios',                cumplimiento: '3 tequios realizados', vinculacion: 'Ayuntamiento', temporalidad: 'Semanal', seguimiento: 'Completado' },
          },
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
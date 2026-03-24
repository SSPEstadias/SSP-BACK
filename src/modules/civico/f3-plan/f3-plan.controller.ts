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
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';


  @ApiTags('📌 F3 — Plan')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f3')
  export class F3PlanController {
    constructor(private readonly service: F3PlanService) {}
  
    // POST /civico/f3  — falla si F1 o F2 no están COMPLETADOS (RF-008)
    @Post()
    @Roles('Admin')
    @ApiBody({
      description: 'Crear Plan de Trabajo (F3) — RF-006. Requiere F1 y F2 COMPLETADOS.',
      examples: {
        'Plan completo': {
          value: {
            expedienteId: '3bdb102a-d997-4ff7-8fc5-8ae2cf6b4cfe',
            coordinadorId: 1,
            fechaInicioEstimada: '2026-04-01',
            fechaTerminoEstimada: '2026-06-01',
            diasAsignados: 'Lunes, Miércoles, Viernes',
            metasPrograma: 'Cumplir con las 40 horas de servicio comunitario asignadas por el juzgado',
            actividadesPlan: {
              EDUCATIVA: { estatus: 'PENDIENTE', objetivo: 'Participar en talleres de educación cívica', cumplimiento: '' },
              LABORAL: { estatus: 'PENDIENTE', objetivo: 'Realizar actividades de mantenimiento comunitario', cumplimiento: '' },
            },
            estatusF3: 'EN_PROCESO',
          },
        },
        'Plan mínimo': {
          value: {
            expedienteId: '3bdb102a-d997-4ff7-8fc5-8ae2cf6b4cfe',
            coordinadorId: 1,
            fechaInicioEstimada: '2026-04-01',
            fechaTerminoEstimada: '2026-06-01',
            actividadesPlan: {
              EDUCATIVA: { estatus: 'PENDIENTE', objetivo: 'Talleres cívicos', cumplimiento: '' },
            },
          },
        },
      },
    })
    create(@Body() dto: CreatePlanTrabajoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f3/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f3/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f3/:id
    @Patch(':id')
  @Roles('Admin')
  @ApiBody({
    type: UpdatePlanTrabajoDto,
    examples: {
      'Actualizar actividades': {
        value: {
          actividadesIds: [3, 5, 7],
          observaciones: 'Actividades reajustadas según progreso',
        },
      },
      'Actualizar solo observaciones': {
        value: {
          observaciones: 'Beneficiario muestra buen comportamiento',
        },
      },
    },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanTrabajoDto,
  ) {
    return this.service.update(id, dto);
  }
  
    // PATCH /civico/f3/:id/estatus
    @Patch(':id/estatus')
  @Roles('Admin')
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
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatusF3') estatusF3: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatusF3);
  }
}
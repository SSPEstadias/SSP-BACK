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
        'Plan Completo (Yahir Leon)': {
          value: {
            expedienteId: '{{EXPEDIENTE_UUID}}',
            coordinadorId: 1,
            fechaInicioEstimada: '2025-04-01',
            fechaTerminoEstimada: '2025-06-01',
            diasAsignados: 'Lunes, Miércoles, Viernes',
            metasPrograma: 'Cumplir con las 48 horas de servicio comunitario y concluir el taller de reeducación.',
            actividadesPlan: {
              TRABAJO_COMUNITARIO: { objetivo: 'Participar en 3 tequios de rescate de espacios', idActividad: 1 },
              EDUCACION_PARA_LA_VIDA: { objetivo: 'Acreditar el Manual Fénix', idActividad: 5 }
            },
            estatusF3: 'COMPLETADO'
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
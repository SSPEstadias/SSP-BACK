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
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

  @ApiTags('📄 F4 — Cédula')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f4')
  export class F4CedulaController {
    constructor(private readonly service: F4CedulaService) {}
  
    // POST /civico/f4
    @Post()
    @Roles('Admin')
    @ApiBody({
      description: 'Crear Cédula Inicial (F4) — RF-009',
      examples: {
        'Cédula completa': {
          value: {
            expedienteId: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
            coordinadorId: 1,
            horasACubrir: 40,
            modalidadFalta: 'Falta administrativa por alteración al orden público',
            procesoIngreso: {
              fechaIngreso: '2026-04-01',
              lugarAsignado: 'Centro Comunitario Norte',
              observaciones: 'Ingresa en condiciones adecuadas',
            },
            estatusF4: 'EN_PROCESO',
          },
        },
        'Cédula mínima': {
          value: {
            expedienteId: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
            coordinadorId: 1,
            horasACubrir: 40,
          },
        },
      },
    })
    create(@Body() dto: CreateCedulaInicialDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f4/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f4/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f4/:id
    @Patch(':id')
    @Roles('Admin')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateCedulaInicialDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/f4/:id/estatus
    @Patch(':id/estatus')
  @Roles('Admin')
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
      required: ['estatus'],
    },
  })
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatusF4') estatusF4: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatusF4);
  }
}
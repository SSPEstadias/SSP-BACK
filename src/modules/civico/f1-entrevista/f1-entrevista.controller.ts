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
import { F1EntrevistaService } from './f1-entrevista.service';
import { CreateEntrevistaClinicaDto } from './dto/create-entrevista-clinica.dto';
import { UpdateEntrevistaClinicaDto } from './dto/update-entrevista-clinica.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { FormStatusEnum } from '../enums/civico.enums';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('📝 F1 — Entrevista')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/f1')
export class F1EntrevistaController {
  constructor(private readonly service: F1EntrevistaService) {}

  // POST /civico/f1
  @Post()
  @Roles('Admin', 'Psicologo')
  @ApiBody({
    description: 'Crear Entrevista Clínica Inicial (F1) — RF-004',
    examples: {
      'Entrevista completa': {
        value: {
          expedienteId: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
          psicologoId: 2,
          fechaEntrevista: '2026-03-24',
          consentimientoInformado: true,
          riesgoSuicida: false,
          consumeSustancias: false,
          padeceEnfermedadCronica: false,
          necesitaApoyoPsicologico: true,
          motivoConsulta: 'Derivado por juzgado cívico — falta administrativa',
          antecedentesClinicos: 'Sin antecedentes relevantes',
          examenMental: 'Orientado, lenguaje coherente, afecto eutímico',
          impresionDiagnostica: 'Sin patología mayor detectada',
          estatusF1: 'EN_PROCESO',
        },
      },
      'Entrevista mínima': {
        value: {
          expedienteId: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
          psicologoId: 2,
          fechaEntrevista: '2026-03-24',
          consentimientoInformado: true,
        },
      },
    },
  })
  create(@Body() dto: CreateEntrevistaClinicaDto) {
    return this.service.create(dto);
  }

  // GET /civico/f1/expediente/:expedienteId
  @Get('expediente/:expedienteId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.findByExpediente(expedienteId);
  }

  // GET /civico/f1/:id
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // PATCH /civico/f1/:id
  @Patch(':id')
  @Roles('Admin', 'Psicologo')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEntrevistaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  // PATCH /civico/f1/:id/estatus
  @Patch(':id/estatus')
  @Roles('Admin', 'Psicologo')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estatus: {
          type: 'string',
          enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'],
          example: 'COMPLETADO',
        },
      },
    },
  })
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatus') estatus: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatus);
  }
}


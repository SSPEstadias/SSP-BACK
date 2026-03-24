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
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('⚠️ Incidencias')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  // ✅ POST: Crear incidencia MANUAL (Sin bitácora - ej. no asistió a nada)
  @Post()
  @Roles('Admin', 'Guia')
  @ApiBody({
    description: 'Crear incidencia desacoplada de bitácora (faltas fuera de actividad)',
    examples: {
      'Falta no justificada': {
        value: {
          expedienteId: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
          guiaId: 3,
          tipo: 'FALTA_INJUSTIFICADA',
          descripcionHechos: 'No se presentó a ninguna actividad sin aviso previo',
          esAcumulativa: true,
        },
      },
      'Retardo injustificado': {
        value: {
          expedienteId: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
          guiaId: 3,
          tipo: 'RETARDO',
          descripcionHechos: 'Llegó 30 minutos tarde a la actividad asignada',
          esAcumulativa: true,
        },
      },
    },
  })
  create(@Body() dto: CreateIncidenciaDto) {
    return this.service.create(dto);
  }

  // GET: Listar incidencias de un expediente
  @Get('expediente/:expedienteId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.findByExpediente(expedienteId);
  }

  // GET: Contar strikes/incidencias acumulativas
  @Get('expediente/:expedienteId/strikes')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  contarStrikes(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.contarStrikes(expedienteId);
  }

  // GET: Obtener una incidencia específica
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // PATCH: Resolver incidencia (cambiar estatus)
  @Patch(':id/resolver')
  @Roles('Admin', 'Guia')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        numOficioNotificacion: {
          type: 'string',
          example: 'OFC-2026-089',
        },
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
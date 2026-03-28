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
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
  
  @ApiTags('📅 Bitácora')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/bitacora')
  export class BitacoraCivicaController {
    constructor(private readonly service: BitacoraCivicaService) {}
  
    // POST /civico/bitacora
    @Post()
    @Roles('Admin', 'Guia')
    @ApiBody({
      description: 'Registrar asistencia en bitácora — RF-011, RF-012, RF-013',
      examples: {
        'Asistencia Completa (Yahir Leon)': {
          value: {
            expedienteId: '{{EXPEDIENTE_UUID}}',
            guiaId: 3,
            fechaActividad: '2025-04-07',
            actividadId: 1,
            horasCubiertas: 4.5,
            asistencia: 'PRESENTE',
            observaciones: 'Participó activamente en el Tequio por la seguridad.'
          },
        },
        'Incidencia - Retardo': {
          value: {
            expedienteId: '{{EXPEDIENTE_UUID}}',
            guiaId: 3,
            fechaActividad: '2025-04-08',
            actividadId: 1,
            horasCubiertas: 3,
            asistencia: 'PRESENTE_PARCIAL',
            incidencia: 'RETARDO',
            detalleIncidencia: 'Llegó 1 hora tarde a la reforestación.'
          },
        },
      },
    })
    create(@Body() dto: CreateBitacoraCivicaDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId/horas
    @Get('expediente/:expedienteId/horas')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    calcularHoras(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.calcularHorasAcumuladas(expedienteId);
    }
  
    // GET /civico/bitacora/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // DELETE /civico/bitacora/:id
    @Delete(':id')
    @Roles('Admin')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.remove(id);
    }
  }
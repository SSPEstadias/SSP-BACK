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
        'Asistencia completa': {
          value: {
            expedienteId: '3bdb102a-d997-4ff7-8fc5-8ae2cf6b4cfe',
            guiaId: 5,
            fechaActividad: '2026-04-07',
            actividadId: 3,
            horasCubiertas: 4,
            asistencia: 'PRESENTE',
            observaciones: 'Excelente participación en taller de liderazgo',
          },
        },
        'Asistencia parcial con incidencia': {
          value: {
            expedienteId: '3bdb102a-d997-4ff7-8fc5-8ae2cf6b4cfe',
            guiaId: 5,
            fechaActividad: '2026-04-08',
            actividadId: 3,
            horasCubiertas: 2,
            asistencia: 'PRESENTE_PARCIAL',
            incidencia: 'RETARDO',
            detalleIncidencia: 'Se presentó 45 minutos tarde sin justificación',
            observaciones: 'Primera incidencia registrada',
          },
        },
        'Falta injustificada': {
          value: {
            expedienteId: '3bdb102a-d997-4ff7-8fc5-8ae2cf6b4cfe',
            guiaId: 5,
            fechaActividad: '2026-04-09',
            horasCubiertas: 0,
            asistencia: 'FALTA_INJUSTIFICADA',
            incidencia: 'FALTA_INJUSTIFICADA',
            detalleIncidencia: 'No se presentó sin previo aviso',
            observaciones: 'Segunda incidencia — se notifica al juzgado',
          },
        },
        'Tercera incidencia (genera BAJA automática)': {
          value: {
            expedienteId: '3bdb102a-d997-4ff7-8fc5-8ae2cf6b4cfe',
            guiaId: 5,
            fechaActividad: '2026-04-10',
            actividadId: 3,
            horasCubiertas: 2,
            asistencia: 'PRESENTE_PARCIAL',
            incidencia: 'CONDUCTA_INAPROPIADA',
            detalleIncidencia: 'Tercera incidencia acumulativa — el sistema cambiará estatusProceso a BAJA_POR_ACUMULACION_DE_INCIDENCIAS',
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
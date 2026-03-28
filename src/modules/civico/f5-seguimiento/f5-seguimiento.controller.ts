import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseUUIDPipe,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { F5SeguimientoService } from './f5-seguimiento.service';
  import { CreateSeguimientoPsicologicoDto } from './dto/create-seguimiento-psicologico.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
  import { UpdateSeguimientoPsicologicoDto } from './dto/update-seguimiento-psicologico.dto';

  @ApiTags('🧠 F5 — Seguimiento')
  @ApiBearerAuth('JWT-Auth')

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f5')
  export class F5SeguimientoController {
    constructor(private readonly service: F5SeguimientoService) {}
  
    // POST /civico/f5
    @Post()
    @Roles('Admin', 'Psicologo')
    @ApiBody({
      description: 'Crear Seguimiento Psicológico (F5) — RF-010',
      examples: {
        'Sesión Completa (Yahir Leon)': {
          value: {
            expedienteId: '{{EXPEDIENTE_UUID}}',
            psicologoId: 1,
            numSesion: 1,
            fechaSesion: '2025-04-07',
            horaSesion: '10:00',
            objetivoSesion: 'Evaluar estado emocional inicial y compromiso con el plan de trabajo.',
            conductaDisposicion: 'Colaborador, con disposición al cambio y reconocimiento de la falta.',
            descripcionIntervencion: 'Se realizó encuadre terapéutico y técnica de respiración diafragmática.',
            temaSesion: 'Control de impulsos y autoreflexión.',
            avancePercibido: 'SATISFACTORIO',
            observaciones: 'Buen pronóstico, se recomienda continuar con el Manual Fénix.'
          },
        },
      },
    })
    create(@Body() dto: CreateSeguimientoPsicologicoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f5/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f5/expediente/:expedienteId/total
    @Get('expediente/:expedienteId/total')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    contarSesiones(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.contarSesiones(expedienteId);
    }
  
    // GET /civico/f5/expediente/:expedienteId/sesion/:num
    @Get('expediente/:expedienteId/sesion/:num')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    findBySesion(
      @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
      @Param('num', ParseIntPipe) num: number,
    ) {
      return this.service.findBySesion(expedienteId, num);
    }
  
    // GET /civico/f5/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f5/:id
    @Patch(':id')
  @Roles('Admin', 'Psicologo')
  @ApiBody({
    type: UpdateSeguimientoPsicologicoDto,
    examples: {
      'Actualizar seguimiento clínico': {
        value: {
          planTerapeutico: 'Sesión 2: Profundizar en técnicas de regulación emocional',
          avancePercibido: 'Moderado',
          observaciones: 'Mejora notable en la expresión de emociones',
        },
      },
      'Registrar intervención': {
        value: {
          descripcionIntervencion: 'Se utilizó técnica de reestructuración cognitiva',
          estrategiaAplicada: 'TCC — Reestructuración de creencias irracionales',
        },
      },
    },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeguimientoPsicologicoDto,
  ) {
    return this.service.update(id, dto);
  }
}
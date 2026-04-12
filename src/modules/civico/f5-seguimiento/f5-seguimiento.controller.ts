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
  import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
  import { UpdateSeguimientoPsicologicoDto } from './dto/update-seguimiento-psicologico.dto';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

  @ApiTags('🧠 F5 — Seguimiento')
  @ApiBearerAuth('JWT-Auth')

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f5')
  export class F5SeguimientoController {
    constructor(private readonly service: F5SeguimientoService) {}
  
    // POST /civico/f5
    @Post()
    @Roles('Admin', 'Psicologo', 'Coordinador')
    @ApiOperation({
      summary: '(Fase 9) Crear Nota de Evolución Psicológica (F5) — RF-010',
      description:
        'Registra cada sesión de seguimiento psicológico del beneficiario durante el programa. ' +
        'El `numSesion` debe ser incremental (1, 2, 3...). ' +
        'El campo `avancePercibido` refleja el progreso terapéutico observado. ' +
        'Las notas se consolidan en el PDF de Nota de Evolución (`GET /civico/documentos/nota-evolucion/{expedienteId}`).',
    })
    @ApiBody({
      description: 'Datos de la sesión de seguimiento psicológico.',
      examples: {
        'Escenario 1 — Primera sesión (inducción)': {
          summary: '(Fase 9, Sesión 1) Primera sesión de seguimiento',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            psicologoId: 2,
            numSesion: 1,
            fechaSesion: '2026-04-07',
            horaSesion: '10:00',
            fechaProximaSesion: '2026-04-14',
            objetivoSesion: 'Encuadre terapéutico y evaluación del estado emocional inicial.',
            conductaDisposicion: 'Colaborador, con disposición al cambio y reconocimiento de la falta cometida.',
            descripcionIntervencion: 'Se realizó encuadre terapéutico. Se aplicó técnica de respiración diafragmática para manejo de ansiedad.',
            temaSesion: 'Autoconocimiento e inicio de proyecto de vida.',
            estrategiaAplicada: 'TCC — Psicoeducación sobre control de impulsos.',
            planTerapeutico: 'Continuar con técnicas de regulación emocional y trabajo en proyecto de vida.',
            actividadesAsignadasUsuario: 'Completar la sección 1 del Manual Fénix para la próxima sesión.',
            avancePercibido: 'INICIAL',
            observaciones: 'Buen pronóstico. Se recomienda continuar con el programa. No se detectó ideación suicida.',
          },
        },
        'Escenario 2 — Sesión de seguimiento (progreso satisfactorio)': {
          summary: '(Sesión 3+) Seguimiento con avance positivo',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            psicologoId: 2,
            numSesion: 3,
            fechaSesion: '2026-04-21',
            horaSesion: '10:00',
            fechaProximaSesion: '2026-04-28',
            objetivoSesion: 'Evaluar avance en el control de impulsos y consolidar técnicas aprendidas.',
            conductaDisposicion: 'Actitud reflexiva y proactiva. Reporta mejora en relaciones interpersonales.',
            descripcionIntervencion: 'Se revisaron ejercicios del Manual Fénix (secciones 1-3). Se utilizó reestructuración cognitiva.',
            temaSesion: 'Manejo de emociones y resolución de conflictos.',
            estrategiaAplicada: 'TCC — Reestructuración de creencias irracionales.',
            planTerapeutico: 'Profundizar en técnicas de comunicación asertiva para las próximas sesiones.',
            actividadesAsignadasUsuario: 'Practicar comunicación asertiva con su familia durante la semana.',
            avancePercibido: 'SATISFACTORIO',
            observaciones: 'El beneficiario demuestra comprensión y aplicación de las técnicas aprendidas.',
          },
        },
        'Escenario 3 — Sesión de cierre (graduación inminente)': {
          summary: 'Última sesión antes de graduación',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            psicologoId: 2,
            numSesion: 8,
            fechaSesion: '2026-06-02',
            horaSesion: '10:00',
            objetivoSesion: 'Cierre terapéutico y evaluación del programa.',
            conductaDisposicion: 'Reflexivo, agradecido, con metas claras para el futuro.',
            descripcionIntervencion: 'Se realizó cierre terapéutico. Se revisó el avance en el proyecto de vida.',
            temaSesion: 'Cierre y proyecto de vida.',
            avancePercibido: 'EXCELENTE',
            observaciones: 'Beneficiario concluye el programa con cambios positivos significativos. Se recomienda dar de alta.',
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'Sesión de seguimiento registrada.',
      schema: {
        type: 'object',
        properties: {
          idUUID: { type: 'string', format: 'uuid', example: 'e5f6a7b8-c9d0-1234-ef01-345678901234' },
          expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
          psicologoId: { type: 'number', example: 2 },
          numSesion: { type: 'number', example: 1 },
          fechaSesion: { type: 'string', format: 'date', example: '2026-04-07' },
          avancePercibido: { type: 'string', example: 'SATISFACTORIO' },
        },
      },
    })
    create(@Body() dto: CreateSeguimientoPsicologicoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f5/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Listar todas las sesiones F5 de un expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({ status: 200, description: 'Lista de sesiones psicológicas ordenadas por número de sesión' })
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f5/expediente/:expedienteId/total
    @Get('expediente/:expedienteId/total')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Contar el total de sesiones F5 de un expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({
      status: 200,
      description: 'Total de sesiones registradas',
      schema: {
        type: 'object',
        properties: { total: { type: 'number', example: 3 } },
      },
    })
    contarSesiones(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.contarSesiones(expedienteId);
    }
  
    // GET /civico/f5/expediente/:expedienteId/sesion/:num
    @Get('expediente/:expedienteId/sesion/:num')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Obtener una sesión F5 específica por número de sesión' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiParam({ name: 'num', description: 'Número de sesión (1, 2, 3...)', example: 1 })
    @ApiResponse({ status: 200, description: 'Sesión psicológica encontrada' })
    @ApiResponse({ status: 404, description: 'No existe sesión con ese número para el expediente' })
    findBySesion(
      @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
      @Param('num', ParseIntPipe) num: number,
    ) {
      return this.service.findBySesion(expedienteId, num);
    }
  
    // GET /civico/f5/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Obtener sesión F5 por UUID del registro' })
    @ApiParam({ name: 'id', description: 'UUID del registro de sesión F5' })
    @ApiResponse({ status: 200, description: 'Sesión psicológica encontrada' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f5/:id
    @Patch(':id')
  @Roles('Admin', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Actualizar datos de una sesión F5' })
  @ApiParam({ name: 'id', description: 'UUID del registro de sesión F5' })
  @ApiBody({
    type: UpdateSeguimientoPsicologicoDto,
    examples: {
      'Actualizar seguimiento clínico': {
        value: {
          planTerapeutico: 'Sesión 2: Profundizar en técnicas de regulación emocional y comunicación asertiva.',
          avancePercibido: 'MODERADO',
          observaciones: 'Mejora notable en la expresión de emociones. Aplica técnicas de respiración en casa.',
        },
      },
      'Registrar intervención': {
        value: {
          descripcionIntervencion: 'Se utilizó técnica de reestructuración cognitiva para trabajar creencias de inutilidad.',
          estrategiaAplicada: 'TCC — Reestructuración de creencias irracionales (Beck, 1979).',
          actividadesAsignadasUsuario: 'Completar el diario de pensamientos automáticos durante la semana.',
        },
      },
      'Agregar fecha próxima sesión': {
        value: {
          fechaProximaSesion: '2026-04-28',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Sesión F5 actualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeguimientoPsicologicoDto,
  ) {
    return this.service.update(id, dto);
  }
}
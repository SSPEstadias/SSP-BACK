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
  import { F2EstudioService } from './f2-estudio.service';
  import { CreateEstudioSocioeconomicoDto } from './dto/create-estudio-socioeconomico.dto';
  import { UpdateEstudioSocioeconomicoDto } from './dto/update-estudio-socioeconomico.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { FormStatusEnum } from '../enums/civico.enums';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

@ApiTags('🏠 F2 — Estudio')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f2')
  export class F2EstudioController {
    constructor(private readonly service: F2EstudioService) {}
  
    // POST /civico/f2
    @Post()
    @Roles('Admin', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({
      summary: '(Fase 5) Crear Estudio Socioeconómico (F2) — RF-005',
      description:
        'Registra el análisis socioeconómico del beneficiario realizado por el Trabajador Social. ' +
        'Este formulario **debe completarse** (`estatusF2: "COMPLETADO"`) junto con el F1 para desbloquear el F3 (RF-008). ' +
        'Los bloques JSONB permiten detallar datos específicos del núcleo familiar y situación económica.',
    })
    @ApiBody({
      description: 'Datos del estudio socioeconómico. Solo `expedienteId` y `trabajadorSocialId` son obligatorios.',
      examples: {
        'Escenario 1 — Familia funcional (clase media baja)': {
          summary: '(Fase 5) Familia estable con ingresos limitados',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            trabajadorSocialId: 3,
            ingresoMensual: 8500.00,
            nivelSocioeconomico: 'BAJO',
            grupoFamiliar: 'FUNCIONAL',
            huboViolenciaIntrafamiliar: false,
            diagnosticoSocial: 'Familia nuclear estable, red de apoyo presente en CDMX. El beneficiario cuenta con soporte familiar para completar el programa.',
            generalesF2: { escolaridad: 'Licenciatura incompleta', ocupacion: 'Estudiante', estadoCivil: 'Soltero' },
            situacionJuridicaF2: { causa: 'CP-2025-AX-099', juzgado: 'JCM-01', horasSentencia: 48, delito: 'Alteración al orden público' },
            nucleoPrimario: { integrantesHogar: 3, relacionConyuge: 'N/A', relacionPadres: 'Buena', relacionHermanos: 'Buena' },
            datosIndiciado: { vivienda: 'Casa propia', transporte: 'Transporte público', horario: 'Disponible lunes a viernes' },
            estatusF2: 'COMPLETADO',
          },
        },
        'Escenario 2 — Familia disfuncional con violencia': {
          summary: 'Familia con problemática de violencia intrafamiliar',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            trabajadorSocialId: 3,
            ingresoMensual: 5200.00,
            nivelSocioeconomico: 'BAJO',
            grupoFamiliar: 'DISFUNCIONAL',
            huboViolenciaIntrafamiliar: true,
            diagnosticoSocial: 'Familia con historial de violencia intrafamiliar. Se recomienda canalización a apoyo psicosocial adicional.',
            nucleoPrimario: { integrantesHogar: 5, relacionConyuge: 'Conflictiva', relacionPadres: 'Distante', consumoAlcohol: true },
            opinionObservaciones: { recomendacion: 'Canalizar a grupos de apoyo familiares', prioridad: 'ALTA' },
            estatusF2: 'COMPLETADO',
          },
        },
        'Escenario 3 — En proceso (visita domiciliaria pendiente)': {
          summary: 'Estudio iniciado pero pendiente de visita domiciliaria',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            trabajadorSocialId: 3,
            ingresoMensual: 12000.00,
            nivelSocioeconomico: 'MEDIO',
            grupoFamiliar: 'FUNCIONAL',
            estatusF2: 'EN_PROCESO',
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'F2 creado. El `idUUID` puede usarse para actualizar con PATCH.',
      schema: {
        type: 'object',
        properties: {
          idUUID: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
          expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
          trabajadorSocialId: { type: 'number', example: 3 },
          nivelSocioeconomico: { type: 'string', example: 'BAJO', enum: ['ALTO', 'MEDIO', 'BAJO'] },
          grupoFamiliar: { type: 'string', example: 'FUNCIONAL', enum: ['FUNCIONAL', 'DISFUNCIONAL'] },
          estatusF2: { type: 'string', example: 'COMPLETADO', enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'] },
        },
      },
    })
    @ApiResponse({ status: 409, description: 'Ya existe un F2 para este expediente (relación 1:1)' })
    @ApiResponse({ status: 404, description: 'No existe un expediente con ese UUID' })
    create(@Body() dto: CreateEstudioSocioeconomicoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f2/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Obtener F2 por expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({ status: 200, description: 'Estudio socioeconómico del expediente' })
    @ApiResponse({ status: 404, description: 'No existe F2 para ese expediente' })
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f2/expediente/:expedienteId/candado-f3
    @Get('expediente/:expedienteId/candado-f3')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({
      summary: 'Verificar candado RF-008 — ¿Se puede crear el F3?',
      description:
        'Verifica si el F1 **y** el F2 están en estatus `COMPLETADO`. ' +
        'Llama este endpoint antes de crear el F3. Si retorna `{ canCrearF3: false }` debes completar primero F1 y/o F2.',
    })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({
      status: 200,
      description: 'Resultado de la verificación del candado',
      schema: {
        type: 'object',
        properties: {
          canCrearF3: { type: 'boolean', example: true },
          f1Completado: { type: 'boolean', example: true },
          f2Completado: { type: 'boolean', example: true },
          mensaje: { type: 'string', example: 'F1 y F2 completados. Puede proceder a crear el F3.' },
        },
      },
    })
    verificarCandado(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.verificarCandadoF3(expedienteId);
    }
  
    // GET /civico/f2/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Obtener F2 por UUID del registro' })
    @ApiParam({ name: 'id', description: 'UUID del registro F2' })
    @ApiResponse({ status: 200, description: 'Estudio socioeconómico encontrado' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f2/:id
    @Patch(':id')
    @Roles('Admin', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({ summary: 'Actualizar datos del estudio socioeconómico F2' })
    @ApiParam({ name: 'id', description: 'UUID del registro F2' })
    @ApiBody({
      type: UpdateEstudioSocioeconomicoDto,
      examples: {
        'Actualizar datos socioeconómicos': {
          value: {
            nivelSocioeconomico: 'MEDIO',
            grupoFamiliar: 'FUNCIONAL',
            diagnosticoSocial: 'Familia con recursos económicos limitados pero funcional. Red de apoyo sólida.',
          },
        },
        'Completar estudio después de visita domiciliaria': {
          value: {
            ingresoMensual: 9000.00,
            huboViolenciaIntrafamiliar: false,
            opinionObservaciones: { conclusion: 'Beneficiario cuenta con condiciones adecuadas para cumplir el programa.' },
            estatusF2: 'COMPLETADO',
          },
        },
      },
    })
    @ApiResponse({ status: 200, description: 'F2 actualizado' })
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateEstudioSocioeconomicoDto,
    ) {
      return this.service.update(id, dto);
    }
  
  
    // PATCH /civico/f2/:id/estatus
    @Patch(':id/estatus')
    @Roles('Admin', 'TrabajoSocial', 'Coordinador')
    @ApiOperation({
      summary: 'Cambiar estatus del F2',
      description: '⚠️ Para desbloquear el F3 (RF-008), el F2 **debe estar en `COMPLETADO`** junto con el F1.',
    })
    @ApiParam({ name: 'id', description: 'UUID del registro F2' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          estatusF2: {
            type: 'string',
            enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'],
            example: 'COMPLETADO',
          },
        },
        required: ['estatusF2'],
      },
    })
    @ApiResponse({ status: 200, description: 'Estatus de F2 actualizado' })
    cambiarEstatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('estatusF2') estatusF2: FormStatusEnum,
    ) {
      return this.service.cambiarEstatus(id, estatusF2);
    }
  }
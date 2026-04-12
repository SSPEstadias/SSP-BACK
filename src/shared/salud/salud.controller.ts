import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SaludService } from './salud.service';
import { CreateSaludDto } from './dto/create-salud.dto';
import { UpdateSaludDto } from './dto/update-salud.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const SALUD_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 1 },
    beneficiarioId: { type: 'number', example: 1 },
    esAptoFisico: { type: 'boolean', example: true },
    padecEnfermedad: { type: 'boolean', example: false },
    nombreEnfermedad: { type: 'string', nullable: true, example: null },
    restriccionesCategorias: {
      type: 'array', nullable: true, example: null,
      description: 'Categorías de actividad que NO puede realizar. NULL = sin restricciones.',
    },
    consumeSustancias: { type: 'boolean', example: false },
    tipoSustancias: { type: 'string', nullable: true, example: null },
    afiliadoServicioSalud: { type: 'string', nullable: true, example: 'IMSS' },
    necesitaLentes: { type: 'boolean', example: false },
    observacionesMedicas: { type: 'string', nullable: true, example: null },
    fechaActualizacion: { type: 'string', format: 'date-time', example: '2025-03-28T10:00:00.000Z' },
  },
};

@ApiTags('🏥 Salud')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salud')
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  // ── POST /salud ────────────────────────────────────────────────────
  @Post()
  @Roles('Admin', 'Psicologo', 'Coordinador')
  @ApiOperation({
    summary: '(Fase 3) Registrar perfil de salud y aptitud física',
    description:
      'Crea el perfil médico del beneficiario (1:1 con `beneficiarios`). ' +
      'Un beneficiario **NO APTO** no puede ser asignado a categorías de actividad física. ' +
      'Los `restriccionesCategorias` indican qué categorías **NO puede realizar** (vacío = sin restricciones).',
  })
  @ApiBody({
    description: 'Perfil de salud del beneficiario. Solo `beneficiarioId` es obligatorio.',
    examples: {
      'Escenario 1 — Apto sin restricciones (caso típico)': {
        summary: 'Beneficiario sano, apto para todas las actividades',
        value: {
          beneficiarioId: 1,
          esAptoFisico: true,
          padecEnfermedad: false,
          restriccionesCategorias: [],
          consumeSustancias: false,
          afiliadoServicioSalud: 'IMSS',
          necesitaLentes: false,
          observacionesMedicas: 'Sin patologías aparentes. Apto para cualquier actividad comunitaria.',
        },
      },
      'Escenario 2 — Apto con restricciones físicas': {
        summary: 'Beneficiario con limitación física parcial',
        value: {
          beneficiarioId: 1,
          esAptoFisico: true,
          padecEnfermedad: true,
          nombreEnfermedad: 'Lumbalgia crónica',
          restriccionesCategorias: ['TRABAJO_COMUNITARIO', 'PROMOCION_CULTURAL_DEPORTIVA'],
          consumeSustancias: false,
          afiliadoServicioSalud: 'ISSSTE',
          necesitaLentes: true,
          observacionesMedicas: 'No puede realizar actividades de carga. Solo actividades sedentarias.',
        },
      },
      'Escenario 3 — No apto (enfermedad grave)': {
        summary: 'Beneficiario no apto para actividades físicas',
        value: {
          beneficiarioId: 1,
          esAptoFisico: false,
          padecEnfermedad: true,
          nombreEnfermedad: 'Cardiopatía isquémica',
          restriccionesCategorias: ['TRABAJO_COMUNITARIO', 'PROMOCION_CULTURAL_DEPORTIVA', 'BRIGADEO_ECOLOGICO'],
          consumeSustancias: false,
          afiliadoServicioSalud: 'Seguro Popular',
          observacionesMedicas: 'Requiere evaluación médica antes de asignar cualquier actividad.',
        },
      },
      'Escenario 4 — Consumo de sustancias': {
        summary: 'Beneficiario con historial de consumo de sustancias',
        value: {
          beneficiarioId: 1,
          esAptoFisico: true,
          padecEnfermedad: false,
          restriccionesCategorias: [],
          consumeSustancias: true,
          tipoSustancias: 'Alcohol y marihuana (consumo moderado reportado)',
          afiliadoServicioSalud: null,
          necesitaLentes: false,
          observacionesMedicas: 'Se recomienda canalización a grupos de autoayuda. Apto físicamente.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Perfil de salud creado correctamente', schema: SALUD_RESPONSE_SCHEMA })
  @ApiResponse({ status: 400, description: 'beneficiarioId inválido o ya existe un perfil para ese beneficiario' })
  create(@Body(ValidationPipe) dto: CreateSaludDto) {
    return this.saludService.create(dto);
  }

  // ── GET /salud ─────────────────────────────────────────────────────
  @Get()
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({ summary: 'Listar todos los perfiles de salud' })
  @ApiResponse({ status: 200, description: 'Lista de perfiles de salud', schema: { type: 'array', items: SALUD_RESPONSE_SCHEMA } })
  findAll() {
    return this.saludService.findAll();
  }

  // ── GET /salud/aptitud?esApto=true ────────────────────────────────
  @Get('aptitud')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({
    summary: 'Filtrar perfiles de salud por aptitud física (RF-005, RF-009)',
    description: 'Útil para identificar beneficiarios que no pueden realizar actividades físicas antes de asignarles el plan.',
  })
  @ApiQuery({ name: 'esApto', type: 'boolean', description: 'true = aptos físicamente, false = no aptos', example: 'true' })
  @ApiResponse({ status: 200, description: 'Lista filtrada por aptitud', schema: { type: 'array', items: SALUD_RESPONSE_SCHEMA } })
  findByAptitud(@Query('esApto') esApto: string) {
    const apto = esApto === 'true';
    return this.saludService.findByAptitudFisica(apto);
  }

  // ── GET /salud/beneficiario/:beneficiarioId ────────────────────────
  @Get('beneficiario/:beneficiarioId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({ summary: 'Obtener perfil de salud por ID de beneficiario' })
  @ApiParam({ name: 'beneficiarioId', description: 'ID numérico del beneficiario', example: 1 })
  @ApiResponse({ status: 200, description: 'Perfil de salud del beneficiario', schema: SALUD_RESPONSE_SCHEMA })
  @ApiResponse({ status: 404, description: 'No existe perfil de salud para ese beneficiario' })
  findByBeneficiarioId(@Param('beneficiarioId', ParseIntPipe) beneficiarioId: number) {
    return this.saludService.findByBeneficiarioId(beneficiarioId);
  }

  // ── GET /salud/:id ────────────────────────────────────────────────
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({ summary: 'Obtener perfil de salud por ID de registro' })
  @ApiParam({ name: 'id', description: 'ID numérico del registro de salud', example: 1 })
  @ApiResponse({ status: 200, description: 'Perfil de salud encontrado', schema: SALUD_RESPONSE_SCHEMA })
  @ApiResponse({ status: 404, description: 'Registro de salud no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saludService.findOne(id);
  }

  // ── PATCH /salud/:id ───────────────────────────────────────────────
  @Patch(':id')
  @Roles('Admin', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Actualizar perfil de salud por ID de registro' })
  @ApiParam({ name: 'id', description: 'ID del registro de salud', example: 1 })
  @ApiBody({
    description: 'Solo incluye los campos a actualizar',
    examples: {
      'Actualizar aptitud': {
        value: { esAptoFisico: false, observacionesMedicas: 'Nuevo diagnóstico: hipertensión detectada en revisión.' },
      },
      'Agregar restricciones': {
        value: { restriccionesCategorias: ['TRABAJO_COMUNITARIO'], necesitaLentes: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado', schema: SALUD_RESPONSE_SCHEMA })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateSaludDto,
  ) {
    return this.saludService.update(id, dto);
  }

  // ── PATCH /salud/beneficiario/:beneficiarioId ──────────────────────
  @Patch('beneficiario/:beneficiarioId')
  @Roles('Admin', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Actualizar perfil de salud por ID de beneficiario' })
  @ApiParam({ name: 'beneficiarioId', description: 'ID numérico del beneficiario', example: 1 })
  @ApiBody({
    description: 'Campos a actualizar en el perfil de salud',
    examples: {
      'Cambiar aptitud': { value: { esAptoFisico: true, observacionesMedicas: 'Recuperado — alta médica.' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado', schema: SALUD_RESPONSE_SCHEMA })
  updateByBeneficiarioId(
    @Param('beneficiarioId', ParseIntPipe) beneficiarioId: number,
    @Body(ValidationPipe) dto: UpdateSaludDto,
  ) {
    return this.saludService.updateByBeneficiarioId(beneficiarioId, dto);
  }

  // ── DELETE /salud/:id ──────────────────────────────────────────────
  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Eliminar perfil de salud [Solo Admin]' })
  @ApiParam({ name: 'id', description: 'ID del registro de salud', example: 1 })
  @ApiResponse({ status: 200, description: 'Perfil de salud eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.saludService.remove(id);
  }
}

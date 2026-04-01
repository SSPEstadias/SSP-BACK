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
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BeneficiariosService } from './beneficiarios.service';
import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const BENEFICIARIO_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 1, description: 'ID entero del beneficiario — usar como beneficiarioId en expedientes y salud' },
    nombre: { type: 'string', example: 'YAHIR LEON REYES' },
    fechaIngreso: { type: 'string', format: 'date', example: '2025-03-28' },
    tiempoAsignado: { type: 'number', example: 48 },
    unidadTiempo: { type: 'string', enum: ['HORAS', 'MESES'], example: 'HORAS' },
    urlFoto: { type: 'string', nullable: true, example: null },
    creadoEn: { type: 'string', format: 'date-time', example: '2025-03-28T10:00:00.000Z' },
  },
};

@ApiTags('📋 Beneficiarios')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('beneficiarios')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) {}

  // ── POST /beneficiarios ───────────────────────────────────────────
  @Post()
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  @ApiOperation({
    summary: '(Fase 1) Registrar un nuevo beneficiario',
    description:
      'Crea el registro base del beneficiario en el módulo compartido. ' +
      'Retorna un `id` numérico que se usa como `beneficiarioId` en:\n' +
      '- `POST /salud` (Fase 3)\n' +
      '- `POST /civico/expedientes` (Fase 2)',
  })
  @ApiBody({
    description: 'Datos mínimos del beneficiario. El campo `nombre` debe ser en MAYÚSCULAS.',
    examples: {
      'Beneficiario con horas (caso típico cívico)': {
        summary: '(Fase 1) Beneficiario sentenciado con horas de servicio',
        value: {
          nombre: 'YAHIR LEON REYES',
          tiempoAsignado: 48,
          unidadTiempo: 'HORAS',
        },
      },
      'Beneficiario con meses (medida cautelar larga)': {
        summary: '(Fase 1) Beneficiario con sentencia en meses',
        value: {
          nombre: 'MARIA GONZALEZ PEREZ',
          tiempoAsignado: 6,
          unidadTiempo: 'MESES',
          urlFoto: 'https://drive.google.com/file/d/ejemplo123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Beneficiario registrado. Guarda el campo `id` como `beneficiarioId` para las siguientes fases.',
    schema: BENEFICIARIO_RESPONSE_SCHEMA,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos (nombre vacío, tiempo <= 0, unidad incorrecta)' })
  create(@Body(ValidationPipe) dto: CreateBeneficiarioDto) {
    return this.beneficiariosService.create(dto);
  }

  // ── GET /beneficiarios ────────────────────────────────────────────
  @Get()
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Listar todos los beneficiarios registrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de beneficiarios',
    schema: { type: 'array', items: BENEFICIARIO_RESPONSE_SCHEMA },
  })
  findAll() {
    return this.beneficiariosService.findAll();
  }

  // ── GET /beneficiarios/filtrar?unidad=HORAS ───────────────────────
  @Get('filtrar')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Filtrar beneficiarios por unidad de tiempo (HORAS o MESES)' })
  @ApiQuery({ name: 'unidad', enum: ['HORAS', 'MESES'], example: 'HORAS' })
  @ApiResponse({
    status: 200,
    description: 'Lista filtrada por unidad de tiempo',
    schema: { type: 'array', items: BENEFICIARIO_RESPONSE_SCHEMA },
  })
  findByUnidad(@Query('unidad') unidad: string) {
    return this.beneficiariosService.findByUnidad(unidad);
  }

  // ── GET /beneficiarios/:id ────────────────────────────────────────
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Obtener un beneficiario por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del beneficiario', example: 1 })
  @ApiResponse({ status: 200, description: 'Beneficiario encontrado', schema: BENEFICIARIO_RESPONSE_SCHEMA })
  @ApiResponse({ status: 404, description: 'Beneficiario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.beneficiariosService.findOne(id);
  }

  // ── PATCH /beneficiarios/:id ──────────────────────────────────────
  @Patch(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  @ApiOperation({ summary: 'Actualizar datos de un beneficiario' })
  @ApiParam({ name: 'id', description: 'ID numérico del beneficiario', example: 1 })
  @ApiBody({
    description: 'Solo incluye los campos que deseas actualizar',
    examples: {
      'Actualizar foto': { value: { urlFoto: 'https://drive.google.com/file/d/nuevaFoto' } },
      'Actualizar tiempo asignado': { value: { tiempoAsignado: 72, unidadTiempo: 'HORAS' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Beneficiario actualizado', schema: BENEFICIARIO_RESPONSE_SCHEMA })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateBeneficiarioDto,
  ) {
    return this.beneficiariosService.update(id, dto);
  }

  // ── DELETE /beneficiarios/:id ─────────────────────────────────────
  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Eliminar un beneficiario [Solo Admin]' })
  @ApiParam({ name: 'id', description: 'ID numérico del beneficiario', example: 1 })
  @ApiResponse({ status: 200, description: 'Beneficiario eliminado correctamente' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar — tiene expedientes asociados (RESTRICT)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beneficiariosService.remove(id);
  }
}

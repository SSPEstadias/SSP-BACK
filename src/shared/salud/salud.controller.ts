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
} from '@nestjs/common';
import { SaludService } from './salud.service';
import { CreateSaludDto } from './dto/create-salud.dto';
import { UpdateSaludDto } from './dto/update-salud.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('🏥 Salud')
@ApiBearerAuth('JWT-Auth')
@Controller('salud')
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  // ── POST /salud ────────────────────────────────────────────────────
  // Crear nuevo perfil de salud para un beneficiario
  // RF-005: Perfil de salud compartido Cívico-Penal
  @Post()
  create(@Body(ValidationPipe) dto: CreateSaludDto) {
    return this.saludService.create(dto);
  }

  // ── GET /salud ─────────────────────────────────────────────────────
  // Listar todos los perfiles de salud
  @Get()
  findAll() {
    return this.saludService.findAll();
  }

  // ── GET /salud/aptitud?esApto=true ────────────────────────────────
  // Filtrar por aptitud física (RF-005, RF-009)
  @Get('aptitud')
  findByAptitud(@Query('esApto') esApto: string) {
    const apto = esApto === 'true';
    return this.saludService.findByAptitudFisica(apto);
  }

  // ── GET /salud/beneficiario/:beneficiarioId ────────────────────────
  // Obtener perfil de salud por beneficiario ID
  @Get('beneficiario/:beneficiarioId')
  findByBeneficiarioId(@Param('beneficiarioId', ParseIntPipe) beneficiarioId: number) {
    return this.saludService.findByBeneficiarioId(beneficiarioId);
  }

  // ── GET /salud/:id ────────────────────────────────────────────────
  // Obtener perfil de salud por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saludService.findOne(id);
  }

  // ── PATCH /salud/:id ───────────────────────────────────────────────
  // Actualizar perfil de salud
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateSaludDto,
  ) {
    return this.saludService.update(id, dto);
  }

  // ── PATCH /salud/beneficiario/:beneficiarioId ──────────────────────
  // Actualizar perfil de salud por beneficiario ID
  @Patch('beneficiario/:beneficiarioId')
  updateByBeneficiarioId(
    @Param('beneficiarioId', ParseIntPipe) beneficiarioId: number,
    @Body(ValidationPipe) dto: UpdateSaludDto,
  ) {
    return this.saludService.updateByBeneficiarioId(beneficiarioId, dto);
  }

  // ── DELETE /salud/:id ──────────────────────────────────────────────
  // Eliminar perfil de salud
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.saludService.remove(id);
  }
}

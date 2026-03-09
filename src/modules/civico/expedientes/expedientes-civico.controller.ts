import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { ExpedientesCivicoService } from './expedientes-civico.service';
import { CreateExpedienteCivicoDto } from './dto/create-expediente-civico.dto';
import { UpdateExpedienteCivicoDto } from './dto/update-expediente-civico.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/expedientes')
export class ExpedientesCivicoController {
  constructor(private readonly service: ExpedientesCivicoService) {}

  // ── POST /civico/expedientes ──────────────────────────────────────
  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateExpedienteCivicoDto) {
    return this.service.create(dto);
  }

  // ── GET /civico/expedientes/caratulas ─────────────────────────────
  // Lista para la pantalla principal — JOIN con beneficiarios
  // Todos los roles pueden ver la lista
  // ⚠️ DEBE ir ANTES de /:id para que NestJS no lo confunda con un UUID
  @Get('caratulas')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findAllCaratulas() {
    return this.service.findAllCaratulas();
  }

  // ── GET /civico/expedientes ───────────────────────────────────────
  // Lista completa (todos los campos, para uso interno/Admin)
  @Get()
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findAll() {
    return this.service.findAll();
  }

  // ── GET /civico/expedientes/curp/:curp ────────────────────────────
  @Get('curp/:curp')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findByCurp(@Param('curp') curp: string) {
    return this.service.findByCurp(curp);
  }

  // ── GET /civico/expedientes/:id/caratula ──────────────────────────
  // Carátula de un expediente específico — para el header del perfil
  @Get(':id/caratula')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findCaratula(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findCaratula(id);
  }

  // ── GET /civico/expedientes/:id ───────────────────────────────────
  // Expediente completo (todos los campos)
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // ── PATCH /civico/expedientes/:id ─────────────────────────────────
  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpedienteCivicoDto,
  ) {
    return this.service.update(id, dto);
  }

  // ── DELETE /civico/expedientes/:id ────────────────────────────────
  @Delete(':id')
  @Roles('Admin')
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deactivate(id);
  }
}
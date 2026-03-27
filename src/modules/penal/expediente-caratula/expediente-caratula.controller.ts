import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpedienteCaratulaService } from './expediente-caratula.service';
import { CreateExpedienteCaratulaDto } from './dto/create-expediente-caratula.dto';
import { UpdateExpedienteCaratulaDto } from './dto/update-expediente-caratula.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { ExpedienteCaratula } from './entities/expediente-caratula.entity';

@Controller('penal/expediente-caratula')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpedienteCaratulaController {
  constructor(private readonly caratulaService: ExpedienteCaratulaService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  create(
    @Body() dto: CreateExpedienteCaratulaDto,
  ): Promise<ExpedienteCaratula> {
    return this.caratulaService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get()
  findAll(): Promise<ExpedienteCaratula[]> {
    return this.caratulaService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ExpedienteCaratula> {
    return this.caratulaService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get('expediente/:expedienteId')
  findByExpediente(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
  ): Promise<ExpedienteCaratula> {
    return this.caratulaService.findByExpediente(expedienteId);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpedienteCaratulaDto,
  ): Promise<ExpedienteCaratula> {
    return this.caratulaService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.caratulaService.remove(id);
  }
}

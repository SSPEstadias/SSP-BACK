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
import { HistorialSupervisionService } from './historial-supervision.service';
import { CreateHistorialSupervisionDto } from './dto/create-historial-supervision.dto';
import { UpdateHistorialSupervisionDto } from './dto/update-historial-supervision.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { HistorialSupervision } from './entities/historial-supervision.entity';

@Controller('penal/historial-supervision')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialSupervisionController {
  constructor(private readonly historialService: HistorialSupervisionService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Post()
  create(
    @Body() dto: CreateHistorialSupervisionDto,
  ): Promise<HistorialSupervision> {
    return this.historialService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get()
  findAll(): Promise<HistorialSupervision[]> {
    return this.historialService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HistorialSupervision> {
    return this.historialService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get('expediente/:expedienteId')
  findByExpediente(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
  ): Promise<HistorialSupervision[]> {
    return this.historialService.findByExpediente(expedienteId);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistorialSupervisionDto,
  ): Promise<HistorialSupervision> {
    return this.historialService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.historialService.remove(id);
  }
}

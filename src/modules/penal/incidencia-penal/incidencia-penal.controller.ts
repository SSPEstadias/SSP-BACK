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
import { IncidenciasPenalService } from './incidencia-penal.service';
import { CreateIncidenciaPenalDto } from './dto/create-incidencia-penal.dto';
import { UpdateIncidenciaPenalDto } from './dto/update-incidencia-penal.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';

@Controller('penal/incidencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidenciasPenalController {
  constructor(
    private readonly incidenciasPenalService: IncidenciasPenalService,
  ) {}

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Post()
  create(@Body() dto: CreateIncidenciaPenalDto) {
    return this.incidenciasPenalService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get()
  findAll() {
    return this.incidenciasPenalService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciasPenalService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get('expediente/:expedienteId')
  findByExpediente(@Param('expedienteId', ParseIntPipe) expedienteId: number) {
    return this.incidenciasPenalService.findByExpediente(expedienteId);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncidenciaPenalDto,
  ) {
    return this.incidenciasPenalService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciasPenalService.remove(id);
  }
}

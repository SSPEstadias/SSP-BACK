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
import { FichaSeguimientoService } from './ficha-seguimiento.service';
import { CreateFichaSeguimientoDto } from './dto/create-ficha-seguimiento.dto';
import { UpdateFichaSeguimientoDto } from './dto/update-ficha-seguimiento.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { FichaSeguimiento } from './entities/ficha-seguimiento.entity';

@Controller('penal/ficha-seguimiento')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FichaSeguimientoController {
  constructor(private readonly fichaService: FichaSeguimientoService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Post()
  create(@Body() dto: CreateFichaSeguimientoDto): Promise<FichaSeguimiento> {
    return this.fichaService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get()
  findAll(): Promise<FichaSeguimiento[]> {
    return this.fichaService.findAll();
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
  ): Promise<FichaSeguimiento[]> {
    return this.fichaService.findByExpediente(expedienteId);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FichaSeguimiento> {
    return this.fichaService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFichaSeguimientoDto,
  ): Promise<FichaSeguimiento> {
    return this.fichaService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.fichaService.remove(id);
  }
}

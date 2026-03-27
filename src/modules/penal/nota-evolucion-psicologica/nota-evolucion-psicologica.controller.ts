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
import { NotaEvolucionPsicologicaService } from './nota-evolucion-psicologica.service';
import { CreateNotaEvolucionPsicologicaDto } from './dto/create-nota-evolucion-psicologica.dto';
import { UpdateNotaEvolucionPsicologicaDto } from './dto/update-nota-evolucion-psicologica.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { NotaEvolucionPsicologica } from './entities/nota-evolucion-psicologica.entity';

@Controller('penal/nota-evolucion-psicologica')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotaEvolucionPsicologicaController {
  constructor(private readonly notaService: NotaEvolucionPsicologicaService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.PSICOLOGO)
  @Post()
  create(
    @Body() dto: CreateNotaEvolucionPsicologicaDto,
  ): Promise<NotaEvolucionPsicologica> {
    return this.notaService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get()
  findAll(): Promise<NotaEvolucionPsicologica[]> {
    return this.notaService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotaEvolucionPsicologica> {
    return this.notaService.findOne(id);
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
  ): Promise<NotaEvolucionPsicologica[]> {
    return this.notaService.findByExpediente(expedienteId);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.PSICOLOGO)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotaEvolucionPsicologicaDto,
  ): Promise<NotaEvolucionPsicologica> {
    return this.notaService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notaService.remove(id);
  }
}

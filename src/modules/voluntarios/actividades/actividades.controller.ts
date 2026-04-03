import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividade.dto';
import { UpdateActividadDto } from './dto/update-actividade.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';

@Controller('voluntarios/actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  // POST /actividades
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Post()
  create(@Body() createActividadDto: CreateActividadDto) {
    return this.actividadesService.create(createActividadDto);
  }

  // GET /actividades
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Get()
  findAll() {
    return this.actividadesService.findAll();
  }

  // GET /actividades/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(id);
  }

  // PUT /actividades/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateActividadDto: UpdateActividadDto) {
    return this.actividadesService.update(id, updateActividadDto);
  }

  // DELETE /actividades/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }
}
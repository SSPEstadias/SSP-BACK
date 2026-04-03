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
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';

@Controller('voluntarios/personas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  // POST /api/personas
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  // GET /api/personas
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Get()
  findAll() {
    return this.personasService.findAll();
  }

  // GET /api/personas/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  // PUT /api/personas/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Put(':id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  // DELETE /api/personas/:id
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { F1EntrevistaService } from './f1-entrevista.service';
import { CreateEntrevistaClinicaDto } from './dto/create-entrevista-clinica.dto';
import { UpdateEntrevistaClinicaDto } from './dto/update-entrevista-clinica.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { FormStatusEnum } from '../enums/civico.enums';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/f1')
export class F1EntrevistaController {
  constructor(private readonly service: F1EntrevistaService) {}

  // POST /civico/f1
  @Post()
  @Roles('Admin', 'Psicologo')
  create(@Body() dto: CreateEntrevistaClinicaDto) {
    return this.service.create(dto);
  }

  // GET /civico/f1/expediente/:expedienteId
  @Get('expediente/:expedienteId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.findByExpediente(expedienteId);
  }

  // GET /civico/f1/:id
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // PATCH /civico/f1/:id
  @Patch(':id')
  @Roles('Admin', 'Psicologo')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEntrevistaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  // PATCH /civico/f1/:id/estatus
  @Patch(':id/estatus')
  @Roles('Admin', 'Psicologo')
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatus') estatus: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatus);
  }
}

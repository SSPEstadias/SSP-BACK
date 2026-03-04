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
  
  @UseGuards(JwtAuthGuard)
  @Controller('civico/f1')
  export class F1EntrevistaController {
    constructor(private readonly service: F1EntrevistaService) {}
  
    // POST /civico/f1
    @Post()
    create(@Body() dto: CreateEntrevistaClinicaDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f1/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f1/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f1/:id
    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateEntrevistaClinicaDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/f1/:id/estatus
    @Patch(':id/estatus')
    cambiarEstatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('estatus') estatus: FormStatusEnum,
    ) {
      return this.service.cambiarEstatus(id, estatus);
    }
  }
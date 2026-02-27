import {
    Controller, Get, Post, Body,
    Param, Patch, ParseIntPipe, ValidationPipe,
  } from '@nestjs/common';
  import { ActividadesService } from './actividades.service';
  import { CreateActividadDto } from './dto/create-actividad.dto';
  
  @Controller('actividades')
  export class ActividadesController {
  
    constructor(private readonly actividadesService: ActividadesService) {}
  
    // POST /actividades
    @Post()
    create(@Body(ValidationPipe) dto: CreateActividadDto) {
      return this.actividadesService.create(dto);
    }
  
    // GET /actividades
    @Get()
    findAll() {
      return this.actividadesService.findAll();
    }
  
    // GET /actividades/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.actividadesService.findOne(id);
    }
  
    // PATCH /actividades/:id/desactivar
    @Patch(':id/desactivar')
    desactivar(@Param('id', ParseIntPipe) id: number) {
      return this.actividadesService.desactivar(id);
    }
  }
import {
    Controller, Get, Post, Body, Patch,
    Param, ParseIntPipe, ValidationPipe, Query,
  } from '@nestjs/common';
  import { ActividadesService } from './actividades.service';
  import { CreateActividadDto } from './dto/create-actividad.dto';
  
  @Controller('actividades')
  export class ActividadesController {
  
    constructor(private readonly actividadesService: ActividadesService) {}
  
    // ── POST /actividades ──────────────────────────────────────────────
    @Post()
    create(@Body(ValidationPipe) dto: CreateActividadDto) {
      return this.actividadesService.create(dto);
    }
  
    // ── GET /actividades ───────────────────────────────────────────────
    // Solo activas (uso normal del sistema)
    @Get()
    findAll() {
      return this.actividadesService.findAll();
    }
  
    // ── GET /actividades/todas ─────────────────────────────────────────
    // Activas + inactivas (solo para Administrador)
    @Get('todas')
    findAllConInactivas() {
      return this.actividadesService.findAllConInactivas();
    }
  
    // ── GET /actividades/categoria?cat=TRABAJO_COMUNITARIO ────────────
    @Get('categoria')
    findByCategoria(@Query('cat') categoria: string) {
      return this.actividadesService.findByCategoria(categoria);
    }
  
    // ── GET /actividades/:id ───────────────────────────────────────────
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.actividadesService.findOne(id);
    }
  
    // ── PATCH /actividades/:id ─────────────────────────────────────────
    // Actualizar caulquier cmapo
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body(ValidationPipe) dto: Partial<CreateActividadDto>,
    ) {
      return this.actividadesService.update(id, dto);
    }
  
    // ── PATCH /actividades/:id/desactivar ─────────────────────────────
    @Patch(':id/desactivar')
    desactivar(@Param('id', ParseIntPipe) id: number) {
      return this.actividadesService.desactivar(id);
    }
  
    // ── PATCH /actividades/:id/reactivar ──────────────────────────────
    @Patch(':id/reactivar')
    reactivar(@Param('id', ParseIntPipe) id: number) {
      return this.actividadesService.reactivar(id);
    }
  }
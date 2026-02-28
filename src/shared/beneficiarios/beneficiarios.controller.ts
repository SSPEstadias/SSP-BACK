import {
    Controller, Get, Post, Body, Patch,
    Param, Delete, ParseIntPipe, ValidationPipe, Query,
  } from '@nestjs/common';
  import { BeneficiariosService } from './beneficiarios.service';
  import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
  import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
  
  @Controller('beneficiarios')
  export class BeneficiariosController {
  
    constructor(private readonly beneficiariosService: BeneficiariosService) {}
  
    // ── POST /beneficiarios ───────────────────────────────────────────
    @Post()
    create(@Body(ValidationPipe) dto: CreateBeneficiarioDto) {
      return this.beneficiariosService.create(dto);
    }
  
    // ── GET /beneficiarios ────────────────────────────────────────────
    @Get()
    findAll() {
      return this.beneficiariosService.findAll();
    }
  
    // ── GET /beneficiarios/filtrar?unidad=HORAS ───────────────────────
    @Get('filtrar')
    findByUnidad(@Query('unidad') unidad: string) {
      return this.beneficiariosService.findByUnidad(unidad);
    }
  
    // ── GET /beneficiarios/:id ────────────────────────────────────────
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.beneficiariosService.findOne(id);
    }
  
    // ── PATCH /beneficiarios/:id ──────────────────────────────────────
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body(ValidationPipe) dto: UpdateBeneficiarioDto,
    ) {
      return this.beneficiariosService.update(id, dto);
    }
  
    // ── DELETE /beneficiarios/:id ─────────────────────────────────────
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.beneficiariosService.remove(id);
    }
  }
import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseUUIDPipe,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { F5SeguimientoService } from './f5-seguimiento.sevice';
  import { CreateSeguimientoPsicologicoDto } from './dto/create-seguimiento-psicologico.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('civico/f5')
  export class F5SeguimientoController {
    constructor(private readonly service: F5SeguimientoService) {}
  
    // POST /civico/f5
    @Post()
    create(@Body() dto: CreateSeguimientoPsicologicoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f5/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f5/expediente/:expedienteId/total
    @Get('expediente/:expedienteId/total')
    contarSesiones(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.contarSesiones(expedienteId);
    }
  
    // GET /civico/f5/expediente/:expedienteId/sesion/:num
    @Get('expediente/:expedienteId/sesion/:num')
    findBySesion(
      @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
      @Param('num', ParseIntPipe) num: number,
    ) {
      return this.service.findBySesion(expedienteId, num);
    }
  
    // GET /civico/f5/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f5/:id
    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: Partial<CreateSeguimientoPsicologicoDto>,
    ) {
      return this.service.update(id, dto);
    }
  }
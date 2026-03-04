import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    ParseUUIDPipe,
    UseGuards,
  } from '@nestjs/common';
  import { BitacoraCivicaService } from './bitacora-civica.service';
  import { CreateBitacoraCivicaDto } from './dto/create-bitacora-civica.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('civico/bitacora')
  export class BitacoraCivicaController {
    constructor(private readonly service: BitacoraCivicaService) {}
  
    // POST /civico/bitacora
    @Post()
    create(@Body() dto: CreateBitacoraCivicaDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId/horas
    @Get('expediente/:expedienteId/horas')
    calcularHoras(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.calcularHorasAcumuladas(expedienteId);
    }
  
    // GET /civico/bitacora/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // DELETE /civico/bitacora/:id
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.remove(id);
    }
  }
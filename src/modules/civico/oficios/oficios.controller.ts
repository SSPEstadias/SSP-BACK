import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    ParseUUIDPipe,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { OficiosService } from './oficios.service';
  import { CreateOficioGeneradoDto } from './dto/create-oficio-generado.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { TipoDocumentoEnum } from '../enums/civico.enums';
  
  @UseGuards(JwtAuthGuard)
  @Controller('civico/oficios')
  export class OficiosController {
    constructor(private readonly service: OficiosService) {}
  
    // POST /civico/oficios
    @Post()
    create(@Body() dto: CreateOficioGeneradoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/oficios/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/oficios/expediente/:expedienteId?tipo=OFICIO_CONCLUSION
    @Get('expediente/:expedienteId/tipo')
    findByTipo(
      @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
      @Query('tipo') tipo: TipoDocumentoEnum,
    ) {
      return this.service.findByTipo(expedienteId, tipo);
    }
  
    // GET /civico/oficios/folio/:folio
    @Get('folio/:folio')
    findByFolio(@Param('folio') folio: string) {
      return this.service.findByFolio(folio);
    }
  
    // GET /civico/oficios/:id/modificaciones
    @Get(':id/modificaciones')
    findModificaciones(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findModificaciones(id);
    }
  
    // GET /civico/oficios/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  }
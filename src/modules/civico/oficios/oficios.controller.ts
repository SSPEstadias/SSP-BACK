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
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

  @ApiTags('📨 Oficios')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/oficios')
  export class OficiosController {
    constructor(private readonly service: OficiosService) {}
  
    // POST /civico/oficios
    @Post()
    @Roles('Admin', 'Guia')
    create(@Body() dto: CreateOficioGeneradoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/oficios/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/oficios/expediente/:expedienteId?tipo=OFICIO_CONCLUSION
    @Get('expediente/:expedienteId/tipo')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByTipo(
      @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
      @Query('tipo') tipo: TipoDocumentoEnum,
    ) {
      return this.service.findByTipo(expedienteId, tipo);
    }
  
    // GET /civico/oficios/folio/:folio
    @Get('folio/:folio')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByFolio(@Param('folio') folio: string) {
      return this.service.findByFolio(folio);
    }
  
    // GET /civico/oficios/:id/modificaciones
    @Get(':id/modificaciones')
    @Roles('Admin', 'Guia')
    findModificaciones(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findModificaciones(id);
    }
  
    // GET /civico/oficios/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  }
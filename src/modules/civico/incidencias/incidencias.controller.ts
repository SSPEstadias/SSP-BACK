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
  import { IncidenciasService } from './incidencias.service';
  import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
  import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/incidencias')
  export class IncidenciasController {
    constructor(private readonly service: IncidenciasService) {}
  
    // POST /civico/incidencias
    @Post()
    @Roles('Admin', 'Guia')
    create(@Body() dto: CreateIncidenciaDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/incidencias/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/incidencias/expediente/:expedienteId/strikes
    // RF-013: conteo de strikes activos para el frontend
    @Get('expediente/:expedienteId/strikes')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    contarStrikes(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.contarStrikes(expedienteId);
    }
  
    // GET /civico/incidencias/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/incidencias/:id
    @Patch(':id')
    @Roles('Admin')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateIncidenciaDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/incidencias/:id/resolver
    @Patch(':id/resolver')
    @Roles('Admin', 'Guia')
    resolver(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('numOficio') numOficio?: string,
    ) {
      return this.service.resolver(id, numOficio);
    }
  }
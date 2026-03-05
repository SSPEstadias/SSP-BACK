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
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/bitacora')
  export class BitacoraCivicaController {
    constructor(private readonly service: BitacoraCivicaService) {}
  
    // POST /civico/bitacora
    @Post()
    @Roles('Admin', 'Guia')
    create(@Body() dto: CreateBitacoraCivicaDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/bitacora/expediente/:expedienteId/horas
    @Get('expediente/:expedienteId/horas')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    calcularHoras(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.calcularHorasAcumuladas(expedienteId);
    }
  
    // GET /civico/bitacora/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // DELETE /civico/bitacora/:id
    @Delete(':id')
    @Roles('Admin')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.remove(id);
    }
  }
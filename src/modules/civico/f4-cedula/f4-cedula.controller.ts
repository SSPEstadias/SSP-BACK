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
  import { F4CedulaService } from './f4-cedula.service';
  import { CreateCedulaInicialDto } from './dto/create-cedula-inicial.dto';
  import { UpdateCedulaInicialDto } from './dto/update-cedula-inicial.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  @UseGuards(JwtAuthGuard)
  @Controller('civico/f4')
  export class F4CedulaController {
    constructor(private readonly service: F4CedulaService) {}
  
    // POST /civico/f4
    @Post()
    create(@Body() dto: CreateCedulaInicialDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f4/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f4/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f4/:id
    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateCedulaInicialDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/f4/:id/estatus
    @Patch(':id/estatus')
    cambiarEstatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('estatus') estatus: FormStatusEnum,
    ) {
      return this.service.cambiarEstatus(id, estatus);
    }
  }
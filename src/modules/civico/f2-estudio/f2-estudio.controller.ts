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
  import { F2EstudioService } from './f2-estudio.service';
  import { CreateEstudioSocioeconomicoDto } from './dto/create-estudio-socioeconomico.dto';
  import { UpdateEstudioSocioeconomicoDto } from './dto/update-estudio-socioeconomico.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  @UseGuards(JwtAuthGuard)
  @Controller('civico/f2')
  export class F2EstudioController {
    constructor(private readonly service: F2EstudioService) {}
  
    // POST /civico/f2
    @Post()
    create(@Body() dto: CreateEstudioSocioeconomicoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f2/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f2/expediente/:expedienteId/candado-f3
    // RF-008: consultado antes de crear el F3
    @Get('expediente/:expedienteId/candado-f3')
    verificarCandado(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.verificarCandadoF3(expedienteId);
    }
  
    // GET /civico/f2/:id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f2/:id
    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateEstudioSocioeconomicoDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/f2/:id/estatus
    @Patch(':id/estatus')
    cambiarEstatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('estatus') estatus: FormStatusEnum,
    ) {
      return this.service.cambiarEstatus(id, estatus);
    }
  }
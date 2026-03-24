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
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';


@ApiTags('🏠 F2 — Estudio')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f2')
  export class F2EstudioController {
    constructor(private readonly service: F2EstudioService) {}
  
    // POST /civico/f2
    @Post()
    @Roles('Admin', 'TrabajoSocial')
    create(@Body() dto: CreateEstudioSocioeconomicoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f2/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f2/expediente/:expedienteId/candado-f3
    // RF-008: consultado antes de crear el F3
    @Get('expediente/:expedienteId/candado-f3')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    verificarCandado(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.verificarCandadoF3(expedienteId);
    }
  
    // GET /civico/f2/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f2/:id
    @Patch(':id')
    @Roles('Admin', 'TrabajoSocial')
    @ApiBody({
      type: UpdateEstudioSocioeconomicoDto,
      examples: {
        'Actualizar datos socioeconómicos': {
          value: {
            nivelSocioeconomico: 'MEDIO',
            grupoFamiliar: 'FUNCIONAL',
            diagnosticoSocial: 'Familia con recursos económicos limitados pero funcional',
          },
        },
        'Actualizar estatus': {
          value: {
            estatusF2: 'EN_PROCESO',
          },
        },
      },
    })
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateEstudioSocioeconomicoDto,
    ) {
      return this.service.update(id, dto);
    }
  
  
    // PATCH /civico/f2/:id/estatus
    @Patch(':id/estatus')
    @Roles('Admin', 'TrabajoSocial')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          estatusF2: {
            type: 'string',
            enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'],
            example: 'COMPLETADO',
          },
        },
        required: ['estatusF2'],
      },
    })
    cambiarEstatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('estatusF2') estatusF2: FormStatusEnum,
    ) {
      return this.service.cambiarEstatus(id, estatusF2);
    }
  }
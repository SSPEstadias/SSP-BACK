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
  import { F3PlanService } from './f3-plan.service';
  import { CreatePlanTrabajoDto } from './dto/create-plan-trabajo.dto';
  import { UpdatePlanTrabajoDto } from './dto/update-plan-trabajo.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { FormStatusEnum } from '../enums/civico.enums';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';


  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/f3')
  export class F3PlanController {
    constructor(private readonly service: F3PlanService) {}
  
    // POST /civico/f3  — falla si F1 o F2 no están COMPLETADOS (RF-008)
    @Post()
    @Roles('Admin')
    create(@Body() dto: CreatePlanTrabajoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/f3/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/f3/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  
    // PATCH /civico/f3/:id
    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdatePlanTrabajoDto,
    ) {
      return this.service.update(id, dto);
    }
  
    // PATCH /civico/f3/:id/estatus
    @Patch(':id/estatus')
    @Roles('Admin')
    cambiarEstatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('estatus') estatus: FormStatusEnum,
    ) {
      return this.service.cambiarEstatus(id, estatus);
    }
  }
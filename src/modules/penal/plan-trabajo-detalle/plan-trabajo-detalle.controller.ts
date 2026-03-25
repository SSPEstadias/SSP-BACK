import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlanTrabajoDetalleService } from './plan-trabajo-detalle.service';
import { CreatePlanTrabajoDetalleDto } from './dto/create-plan-trabajo-detalle.dto';
import { UpdatePlanTrabajoDetalleDto } from './dto/update-plan-trabajo-detalle.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { PlanTrabajoDetalle } from './entities/plan-trabajo-detalle.entity';

@Controller('penal/plan-trabajo-detalle')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanTrabajoDetalleController {
  constructor(private readonly detalleService: PlanTrabajoDetalleService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Post()
  create(
    @Body() dto: CreatePlanTrabajoDetalleDto,
  ): Promise<PlanTrabajoDetalle> {
    return this.detalleService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get()
  findAll(): Promise<PlanTrabajoDetalle[]> {
    return this.detalleService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PlanTrabajoDetalle> {
    return this.detalleService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get('plan/:planTrabajoId')
  findByPlan(
    @Param('planTrabajoId', ParseIntPipe) planTrabajoId: number,
  ): Promise<PlanTrabajoDetalle[]> {
    return this.detalleService.findByPlan(planTrabajoId);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanTrabajoDetalleDto,
  ): Promise<PlanTrabajoDetalle> {
    return this.detalleService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.detalleService.remove(id);
  }
}

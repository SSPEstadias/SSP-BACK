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
import { PlanTrabajoService } from './plan-trabajo.service';
import { CreatePlanTrabajoDto } from './dto/create-plan-trabajo.dto';
import { UpdatePlanTrabajoDto } from './dto/update-plan-trabajo.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { PlanTrabajo } from './entities/plan-trabajo.entity';

@Controller('penal/plan-trabajo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanTrabajoController {
  constructor(private readonly planService: PlanTrabajoService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Post()
  create(@Body() dto: CreatePlanTrabajoDto): Promise<PlanTrabajo> {
    return this.planService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get()
  findAll(): Promise<PlanTrabajo[]> {
    return this.planService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PlanTrabajo> {
    return this.planService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.GUIA,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
  )
  @Get('expediente/:expedienteId')
  findByExpediente(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
  ): Promise<PlanTrabajo[]> {
    return this.planService.findByExpediente(expedienteId);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.GUIA)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanTrabajoDto,
  ): Promise<PlanTrabajo> {
    return this.planService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.planService.remove(id);
  }
}

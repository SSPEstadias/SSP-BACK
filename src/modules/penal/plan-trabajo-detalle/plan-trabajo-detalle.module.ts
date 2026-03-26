import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanTrabajoDetalleService } from './plan-trabajo-detalle.service';
import { PlanTrabajoDetalleController } from './plan-trabajo-detalle.controller';
import { PlanTrabajoDetalle } from './entities/plan-trabajo-detalle.entity';
import { PlanTrabajo } from '../plan-trabajo/entities/plan-trabajo.entity';
import { Actividad } from '../../../shared/actividades/actividad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanTrabajoDetalle, PlanTrabajo, Actividad]),
  ],
  controllers: [PlanTrabajoDetalleController],
  providers: [PlanTrabajoDetalleService],
})
export class PlanTrabajoDetalleModule {}

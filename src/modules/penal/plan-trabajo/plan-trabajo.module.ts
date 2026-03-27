import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanTrabajoService } from './plan-trabajo.service';
import { PlanTrabajoController } from './plan-trabajo.controller';
import { PlanTrabajo } from './entities/plan-trabajo.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanTrabajo, PenalExpediente, User])],
  controllers: [PlanTrabajoController],
  providers: [PlanTrabajoService],
})
export class PlanTrabajoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpedienteCaratulaService } from './expediente-caratula.service';
import { ExpedienteCaratulaController } from './expediente-caratula.controller';
import { ExpedienteCaratula } from './entities/expediente-caratula.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { ValoracionPsicologica } from '../valoracion-psicologica/entities/valoracion-psicologica.entity';
import { EstudioTrabajoSocial } from '../estudio-trabajo-social/entities/estudio-trabajo-social.entity';
import { PlanTrabajo } from '../plan-trabajo/entities/plan-trabajo.entity';
import { PlanTrabajoDetalle } from '../plan-trabajo-detalle/entities/plan-trabajo-detalle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCaratula,
      PenalExpediente,
      ValoracionPsicologica,
      EstudioTrabajoSocial,
      PlanTrabajo,
      PlanTrabajoDetalle,
    ]),
  ],
  controllers: [ExpedienteCaratulaController],
  providers: [ExpedienteCaratulaService],
})
export class ExpedienteCaratulaModule {}

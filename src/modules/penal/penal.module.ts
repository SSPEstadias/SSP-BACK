import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenalService } from './penal.service';
import { PenalController } from './penal.controller';
import { PenalExpediente } from './entities/penal.entity';
import { Beneficiario } from '../../shared/beneficiarios/beneficiario.entity';
import { ValoracionPsicologicaModule } from './valoracion-psicologica/valoracion-psicologica.module';
import { EstudioTrabajoSocialModule } from './estudio-trabajo-social/estudio-trabajo-social.module';
import { PlanTrabajoModule } from './plan-trabajo/plan-trabajo.module';
import { PlanTrabajoDetalleModule } from './plan-trabajo-detalle/plan-trabajo-detalle.module';
import { ExpedienteCaratulaModule } from './expediente-caratula/expediente-caratula.module';
import { FichaSeguimientoModule } from './ficha-seguimiento/ficha-seguimiento.module';
import { HistorialSupervisionModule } from './historial-supervision/historial-supervision.module';
import { NotaEvolucionPsicologicaModule } from './nota-evolucion-psicologica/nota-evolucion-psicologica.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PenalExpediente, Beneficiario]),
    ValoracionPsicologicaModule,
    EstudioTrabajoSocialModule,
    PlanTrabajoModule,
    PlanTrabajoDetalleModule,
    PlanTrabajoDetalleModule,
    ExpedienteCaratulaModule,
    FichaSeguimientoModule,
    HistorialSupervisionModule,
    NotaEvolucionPsicologicaModule,
  ],
  controllers: [PenalController],
  providers: [PenalService],
})
export class PenalModule {}

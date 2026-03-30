import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosPenalService } from './documentos-penal.service';
import { DocumentosPenalController } from './documentos-penal.controller';
import { ExpedienteCaratula } from '../expediente-caratula/entities/expediente-caratula.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';
import { FichaSeguimiento } from '../ficha-seguimiento/entities/ficha-seguimiento.entity';
import { NotaEvolucionPsicologica } from '../nota-evolucion-psicologica/entities/nota-evolucion-psicologica.entity';
import { PlanTrabajo } from '../plan-trabajo/entities/plan-trabajo.entity';
import { PlanTrabajoDetalle } from '../plan-trabajo-detalle/entities/plan-trabajo-detalle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCaratula,
      PenalExpediente,
      Beneficiario,
      FichaSeguimiento,
      NotaEvolucionPsicologica,
      PlanTrabajo,
      PlanTrabajoDetalle,
    ]),
  ],
  controllers: [DocumentosPenalController],
  providers: [DocumentosPenalService],
  exports: [DocumentosPenalService],
})
export class DocumentosPenalModule {}

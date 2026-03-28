import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosPenalService } from './documentos-penal.service';
import { DocumentosPenalController } from './documentos-penal.controller';
import { ExpedienteCaratula } from '../expediente-caratula/entities/expediente-caratula.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';
import { FichaSeguimiento } from '../ficha-seguimiento/entities/ficha-seguimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCaratula,
      PenalExpediente,
      Beneficiario,
      FichaSeguimiento,
    ]),
  ],
  controllers: [DocumentosPenalController],
  providers: [DocumentosPenalService],
  exports: [DocumentosPenalService],
})
export class DocumentosPenalModule {}

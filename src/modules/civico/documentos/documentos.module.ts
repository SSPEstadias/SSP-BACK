import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';

import { ExpedienteCivico }  from '../expedientes/expediente-civico.entity';
import { Beneficiario }      from '../../../shared/beneficiarios/beneficiario.entity';
import { EntrevistaClinica } from '../f1-entrevista/entrevista-clinica.entity';
import { PlanTrabajo }       from '../f3-plan/plan-trabajo.entity';
import { CedulaInicial }     from '../f4-cedula/cedula-inicial';
import { Incidencia }        from '../incidencias/incidencia.entity';
import { BitacoraCivica }    from '../bitacora/bitacora-civica.entity';
import { User }              from '../../../shared/users/entities/user.entity';
import { OficioGenerado }    from '../oficios/oficio-generado.entity';
import { SeguimientoPsicologico } from '../f5-seguimiento/seguimiento-psicologico.entity';
import { CivicoGoogleDriveModule } from '../../../shared/google-drive/civico-google-drive.module';

@Module({
  imports: [
    CivicoGoogleDriveModule,
    TypeOrmModule.forFeature([
      ExpedienteCivico,
      Beneficiario,
      EntrevistaClinica,
      PlanTrabajo,
      CedulaInicial,
      Incidencia,
      BitacoraCivica,
      User,
      OficioGenerado,
      SeguimientoPsicologico,
    ]),
  ],
  controllers: [DocumentosController],
  providers:   [DocumentosService],
  exports:     [DocumentosService],
})
export class DocumentosModule {}
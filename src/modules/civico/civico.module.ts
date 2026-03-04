import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ── Entidades ─────────────────────────────────────────────────────────
import { ExpedienteCivico }      from './expedientes/expediente-civico.entity';
import { BitacoraCivica }        from './bitacora/bitacora-civica.entity';
import { EntrevistaClinica }     from './f1-entrevista/entrevista-clinica.entity';
import { EstudioSocioeconomico } from './f2-estudio/estudio-socioeconomico.entity';
import { PlanTrabajo }           from './f3-plan/plan-trabajo.entity';
import { Incidencia }            from './incidencias/incidencia.entity';

// ── Servicios ─────────────────────────────────────────────────────────
import { ExpedientesCivicoService } from './expedientes/expedientes-civico.service';
import { BitacoraCivicaService }    from './bitacora/bitacora-civica.service';
import { F1EntrevistaService }      from './f1-entrevista/f1-entrevista.service';
import { F2EstudioService }         from './f2-estudio/f2-estudio.service';
import { F3PlanService }            from './f3-plan/f3-plan.service';
import { IncidenciasService }       from './incidencias/incidencias.service';

// ── Controladores ─────────────────────────────────────────────────────
import { ExpedientesCivicoController } from './expedientes/expedientes-civico.controller';
import { BitacoraCivicaController }    from './bitacora/bitacora-civica.controller';
import { F1EntrevistaController }      from './f1-entrevista/f1-entrevista.controller';
import { F2EstudioController }         from './f2-estudio/f2-estudio.controller';
import { F3PlanController }            from './f3-plan/f3-plan.controller';
import { IncidenciasController }       from './incidencias/incidencias.controller';

// ── Núcleo compartido ─────────────────────────────────────────────────
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCivico,
      BitacoraCivica,
      EntrevistaClinica,
      EstudioSocioeconomico,
      PlanTrabajo,
      Incidencia,
    ]),
    SharedModule,
  ],
  controllers: [
    ExpedientesCivicoController,
    BitacoraCivicaController,
    F1EntrevistaController,
    F2EstudioController,
    F3PlanController,
    IncidenciasController,
  ],
  providers: [
    ExpedientesCivicoService,
    BitacoraCivicaService,
    F1EntrevistaService,
    F2EstudioService,
    F3PlanService,
    IncidenciasService,
  ],
  exports: [
    ExpedientesCivicoService,
    F1EntrevistaService,
    F2EstudioService,
  ],
})
export class CivicoModule {}
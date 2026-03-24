import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ── Entidades (9 tablas completas del módulo) ─────────────────────────
import { ExpedienteCivico }        from './expedientes/expediente-civico.entity';
import { BitacoraCivica }          from './bitacora/bitacora-civica.entity';
import { EntrevistaClinica }       from './f1-entrevista/entrevista-clinica.entity';
import { EstudioSocioeconomico }   from './f2-estudio/estudio-socioeconomico.entity';
import { PlanTrabajo }             from './f3-plan/plan-trabajo.entity';
import { Incidencia }              from './incidencias/incidencia.entity';
import { CedulaInicial }           from './f4-cedula/cedula-inicial';
import { SeguimientoPsicologico }  from './f5-seguimiento/seguimiento-psicologico.entity';
import { OficioGenerado }          from './oficios/oficio-generado.entity';

// ── Servicios ─────────────────────────────────────────────────────────
import { ExpedientesCivicoService }  from './expedientes/expedientes-civico.service';
import { BitacoraCivicaService }     from './bitacora/bitacora-civica.service';
import { F1EntrevistaService }       from './f1-entrevista/f1-entrevista.service';
import { F2EstudioService }          from './f2-estudio/f2-estudio.service';
import { F3PlanService }             from './f3-plan/f3-plan.service';
import { IncidenciasService }        from './incidencias/incidencias.service';
import { F4CedulaService }           from './f4-cedula/f4-cedula.service';
import { F5SeguimientoService }      from './f5-seguimiento/f5-seguimiento.service';
import { OficiosService }            from './oficios/oficios.service';

// ── Controladores ─────────────────────────────────────────────────────
import { ExpedientesCivicoController }  from './expedientes/expedientes-civico.controller';
import { BitacoraCivicaController }     from './bitacora/bitacora-civica.controller';
import { F1EntrevistaController }       from './f1-entrevista/f1-entrevista.controller';
import { F2EstudioController }          from './f2-estudio/f2-estudio.controller';
import { F3PlanController }             from './f3-plan/f3-plan.controller';
import { IncidenciasController }        from './incidencias/incidencias.controller';
import { F4CedulaController }           from './f4-cedula/f4-cedula.controller';
import { F5SeguimientoController }      from './f5-seguimiento/f5-seguimiento.controller';
import { OficiosController }            from './oficios/oficios.controller';

// ── Núcleo compartido ─────────────────────────────────────────────────
import { SharedModule } from '../../shared/shared.module';
// ── Entidades compartidas que BitacoraService necesita leer ──────────
import { Salud } from 'src/shared/salud/salud.entity';
import { Actividad } from 'src/shared/actividades/actividad.entity';
import { Beneficiario } from 'src/shared/beneficiarios/beneficiario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCivico,
      BitacoraCivica,
      EntrevistaClinica,
      EstudioSocioeconomico,
      PlanTrabajo,
      Incidencia,
      CedulaInicial,
      SeguimientoPsicologico,
      OficioGenerado,
      Beneficiario,  
      Salud,
      Actividad,
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
    F4CedulaController,
    F5SeguimientoController,
    OficiosController,
  ],
  providers: [
    ExpedientesCivicoService,
    BitacoraCivicaService,
    F1EntrevistaService,
    F2EstudioService,
    F3PlanService,
    IncidenciasService,
    F4CedulaService,
    F5SeguimientoService,
    OficiosService,
  ],
  exports: [
    ExpedientesCivicoService,
    F1EntrevistaService,
    F2EstudioService,
    BitacoraCivicaService,
  ],
})
export class CivicoModule {}
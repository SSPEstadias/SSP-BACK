import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { ExpedienteCivico }     from './expedientes/expediente-civico.entity';
import { BitacoraCivica }       from './bitacora/bitacora-civica.entity';
import { EntrevistaClinica }    from './f1-entrevista/entrevista-clinica.entity';
import { EstudioSocioeconomico } from './f2-estudio/estudio-socioeconomico.entity';

// Servicios
import { ExpedientesCivicoService } from './expedientes/expedientes-civico.service';
import { BitacoraCivicaService }    from './bitacora/bitacora-civica.service';
import { F1EntrevistaService }      from './f1-entrevista/f1-entrevista.service';
import { F2EstudioService }         from './f2-estudio/f2-estudio.service';

// Controladores
import { ExpedientesCivicoController } from './expedientes/expedientes-civico.controller';
import { BitacoraCivicaController }    from './bitacora/bitacora-civica.controller';
import { F1EntrevistaController }      from './f1-entrevista/f1-entrevista.controller';
import { F2EstudioController }         from './f2-estudio/f2-estudio.controller';

// Núcleo compartido
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCivico,
      BitacoraCivica,
      EntrevistaClinica,
      EstudioSocioeconomico,
    ]),
    SharedModule,
  ],
  controllers: [
    ExpedientesCivicoController,
    BitacoraCivicaController,
    F1EntrevistaController,
    F2EstudioController,
  ],
  providers: [
    ExpedientesCivicoService,
    BitacoraCivicaService,
    F1EntrevistaService,
    F2EstudioService,
  ],
  exports: [
    ExpedientesCivicoService,
    F1EntrevistaService, // ← F3 necesitará verificar estatus F1
    F2EstudioService,    // ← F3 necesitará verificar estatus F2 (candado RF-008)
  ],
})
export class CivicoModule {}
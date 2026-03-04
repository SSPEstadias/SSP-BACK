import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades del módulo Cívico
import { ExpedienteCivico } from './expedientes/expediente-civico.entity';
import { BitacoraCivica } from './bitacora/bitacora-civica.entity';

// Servicios y controladores
import { ExpedientesCivicoService } from './expedientes/expedientes-civico.service';
import { ExpedientesCivicoController } from './expedientes/expedientes-civico.controller';
import { BitacoraCivicaService } from './bitacora/bitacora-civica.service';
import { BitacoraCivicaController } from './bitacora/bitacora-civica.controller';

// Módulos del núcleo compartido que necesitamos
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpedienteCivico,
      BitacoraCivica,
    ]),
    SharedModule, // Expone BeneficiariosService, UsersService, ActividadesService, AuthModule
  ],
  controllers: [
    ExpedientesCivicoController,
    BitacoraCivicaController,
  ],
  providers: [
    ExpedientesCivicoService,
    BitacoraCivicaService,
  ],
  exports: [
    ExpedientesCivicoService,
    // Exportamos el servicio por si lo necesita algún submódulo (F1, F2, F3...)
  ],
})
export class CivicoModule {}
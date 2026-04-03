import { Module } from '@nestjs/common';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { ActividadesModule } from './actividades/actividades.module';
import { SaludModule } from './salud/salud.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CivicoGoogleDriveModule } from './google-drive/civico-google-drive.module';

@Module({
  imports: [
    BeneficiariosModule,
    ActividadesModule,
    SaludModule,
    UsersModule,
    AuthModule,
    CivicoGoogleDriveModule,
  ],
  exports: [
    BeneficiariosModule,
    ActividadesModule,
    SaludModule,
    UsersModule,
    AuthModule,
    CivicoGoogleDriveModule,

    // Cualquier módulo de negocio (civico, penal, voluntarios) que importe SharedModule
    // tendrá acceso a todos los servicios y al JwtAuthGuard
  ],
})
export class SharedModule {}



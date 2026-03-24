import { Module } from '@nestjs/common';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { ActividadesModule } from './actividades/actividades.module';
import { SaludModule } from './salud/salud.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    BeneficiariosModule,
    ActividadesModule,
    SaludModule,
    UsersModule,
    AuthModule,
  ],
  exports: [
    BeneficiariosModule,
    ActividadesModule,
    SaludModule,
    UsersModule,
    AuthModule,

    // Cualquier módulo de negocio (civico, penal) que importe SharedModule
    // tendrá acceso a todos los servicios y al JwtAuthGuard
  ],
})
export class SharedModule {}



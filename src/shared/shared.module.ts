import { Module } from '@nestjs/common';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { ActividadesModule } from './actividades/actividades.module';
import { SaludModule } from './salud/salud.module';

@Module({
  imports: [BeneficiariosModule, ActividadesModule, SaludModule],
  exports: [BeneficiariosModule, ActividadesModule, SaludModule],
  // Cualquier módulo que importe SharedModule tendrá acceso a todos los submódulos
})
export class SharedModule {}
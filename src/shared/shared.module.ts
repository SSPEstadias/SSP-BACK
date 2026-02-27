import { Module } from '@nestjs/common';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { ActividadesModule } from './actividades/actividades.module';

@Module({
  imports: [BeneficiariosModule, ActividadesModule],
  exports: [BeneficiariosModule, ActividadesModule],
  // Cualquier módulo que importe SharedModule tendrá acceso a ambos
})
export class SharedModule {}
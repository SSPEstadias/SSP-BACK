import { Module } from '@nestjs/common';
import { PersonasModule } from './personas/personas.module';
import { ActividadesModule } from './actividades/actividades.module';

@Module({
  imports: [PersonasModule, ActividadesModule],
})
export class VoluntarioModule {}
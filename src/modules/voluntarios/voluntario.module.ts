import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { PersonasModule } from './personas/personas.module';
import { ActividadesModule } from './actividades/actividades.module';

@Module({
  imports: [SharedModule, PersonasModule, ActividadesModule],
})
export class VoluntarioModule {}
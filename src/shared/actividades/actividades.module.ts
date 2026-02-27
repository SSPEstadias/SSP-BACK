import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from './actividad.entity';
import { ActividadesService } from './actividades.service';
import { ActividadesController } from './actividades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad])],
  controllers: [ActividadesController],
  providers: [ActividadesService],
  exports: [ActividadesService, TypeOrmModule],
  // exports: permite que el módulo Cívico use las actividades en su bitácora
})
export class ActividadesModule {}
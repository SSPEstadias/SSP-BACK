import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salud } from './salud.entity';
import { SaludController } from './salud.controller';
import { SaludService } from './salud.service';

@Module({
  imports: [TypeOrmModule.forFeature([Salud])],
  controllers: [SaludController],
  providers: [SaludService],
  exports: [SaludService,],
  // Exporta SaludService  para que otros módulos puedan inyectar el repositorio
})
export class SaludModule {}

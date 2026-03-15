import { Module } from '@nestjs/common';
import { ValoracionPsicologicaService } from './valoracion-psicologica.service';
import { ValoracionPsicologicaController } from './valoracion-psicologica.controller';

@Module({
  controllers: [ValoracionPsicologicaController],
  providers: [ValoracionPsicologicaService],
})
export class ValoracionPsicologicaModule {}

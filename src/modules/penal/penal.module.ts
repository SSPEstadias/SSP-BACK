import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenalService } from './penal.service';
import { PenalController } from './penal.controller';
import { PenalExpediente } from './entities/penal.entity';
import { Beneficiario } from '../../shared/beneficiarios/beneficiario.entity';
import { ValoracionPsicologicaModule } from './valoracion-psicologica/valoracion-psicologica.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PenalExpediente,
      Beneficiario,
      ValoracionPsicologicaModule,
    ]),
    ValoracionPsicologicaModule,
  ],
  controllers: [PenalController],
  providers: [PenalService],
})
export class PenalModule {}

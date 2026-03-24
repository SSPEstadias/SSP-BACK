import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValoracionPsicologicaService } from './valoracion-psicologica.service';
import { ValoracionPsicologicaController } from './valoracion-psicologica.controller';
import { ValoracionPsicologica } from './entities/valoracion-psicologica.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValoracionPsicologica, PenalExpediente, User]),
  ],
  controllers: [ValoracionPsicologicaController],
  providers: [ValoracionPsicologicaService],
})
export class ValoracionPsicologicaModule {}

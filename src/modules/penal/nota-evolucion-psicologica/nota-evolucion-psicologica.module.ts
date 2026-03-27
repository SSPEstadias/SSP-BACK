import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaEvolucionPsicologicaService } from './nota-evolucion-psicologica.service';
import { NotaEvolucionPsicologicaController } from './nota-evolucion-psicologica.controller';
import { NotaEvolucionPsicologica } from './entities/nota-evolucion-psicologica.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotaEvolucionPsicologica, PenalExpediente, User]),
  ],
  controllers: [NotaEvolucionPsicologicaController],
  providers: [NotaEvolucionPsicologicaService],
})
export class NotaEvolucionPsicologicaModule {}

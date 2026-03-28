import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenciasPenalController } from './incidencia-penal.controller';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';
import { IncidenciasPenalService } from './incidencia-penal.service';
import { IncidenciaPenal } from './entities/incidencia-penal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncidenciaPenal, PenalExpediente, User])],
  controllers: [IncidenciasPenalController],
  providers: [IncidenciasPenalService],
  exports: [IncidenciasPenalService],
})
export class IncidenciasPenalModule {}

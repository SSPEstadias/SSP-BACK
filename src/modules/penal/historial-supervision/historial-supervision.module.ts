import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialSupervisionService } from './historial-supervision.service';
import { HistorialSupervisionController } from './historial-supervision.controller';
import { HistorialSupervision } from './entities/historial-supervision.entity';
import { PenalExpediente } from '../entities/penal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialSupervision, PenalExpediente])],
  controllers: [HistorialSupervisionController],
  providers: [HistorialSupervisionService],
})
export class HistorialSupervisionModule {}

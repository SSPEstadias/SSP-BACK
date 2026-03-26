import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichaSeguimientoService } from './ficha-seguimiento.service';
import { FichaSeguimientoController } from './ficha-seguimiento.controller';
import { FichaSeguimiento } from './entities/ficha-seguimiento.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FichaSeguimiento, PenalExpediente, User]),
  ],
  controllers: [FichaSeguimientoController],
  providers: [FichaSeguimientoService],
})
export class FichaSeguimientoModule {}

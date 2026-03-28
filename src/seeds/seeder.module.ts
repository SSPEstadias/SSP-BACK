import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../shared/users/entities/user.entity';
import { Actividad } from '../shared/actividades/actividad.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Actividad]),
    // Registra las entidades necesarias para el seed
  ],
  providers: [SeederService],
})
export class SeederModule {}
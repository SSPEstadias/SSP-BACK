import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../shared/users/entities/user.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // Registra la entidad User en este módulo para poder inyectarla
  ],
  providers: [SeederService],
})
export class SeederModule {}
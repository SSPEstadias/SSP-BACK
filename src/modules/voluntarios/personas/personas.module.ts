import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { VoluntariosGoogleDriveModule } from 'src/shared/google-drive/voluntarios-google-drive.module';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { Persona } from './entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona]), SharedModule, VoluntariosGoogleDriveModule],
  controllers: [PersonasController],
  providers: [PersonasService],
  exports: [PersonasService],
})
export class PersonasModule {}
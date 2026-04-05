import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { VoluntariosGoogleDriveModule } from 'src/shared/google-drive/voluntarios-google-drive.module';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { PersonasCsvService } from './personas-csv.service';
import { PersonasCsvController } from './personas-csv.controller';
import { Persona } from './entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona]), SharedModule, VoluntariosGoogleDriveModule],
  controllers: [PersonasController,PersonasCsvController],
  providers: [PersonasService,PersonasCsvService],
  exports: [PersonasService],
})
export class PersonasModule {}
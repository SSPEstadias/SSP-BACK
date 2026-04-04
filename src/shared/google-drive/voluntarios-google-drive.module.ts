import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VoluntariosGoogleDriveService } from './voluntarios-google-drive.service';

@Module({
  imports: [ConfigModule],
  providers: [VoluntariosGoogleDriveService],
  exports: [VoluntariosGoogleDriveService],
})
export class VoluntariosGoogleDriveModule {}

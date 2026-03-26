import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CivicoGoogleDriveService } from './civico-google-drive.service';

@Module({
  imports: [ConfigModule],
  providers: [CivicoGoogleDriveService],
  exports: [CivicoGoogleDriveService],
})
export class CivicoGoogleDriveModule {}

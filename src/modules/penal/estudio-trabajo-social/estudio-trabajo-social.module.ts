import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudioTrabajoSocialService } from './estudio-trabajo-social.service';
import { EstudioTrabajoSocialController } from './estudio-trabajo-social.controller';
import { EstudioTrabajoSocial } from './entities/estudio-trabajo-social.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EstudioTrabajoSocial, PenalExpediente, User]),
  ],
  controllers: [EstudioTrabajoSocialController],
  providers: [EstudioTrabajoSocialService],
})
export class EstudioTrabajoSocialModule {}

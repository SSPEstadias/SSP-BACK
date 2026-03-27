import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudioTrabajoSocialDto } from './create-estudio-trabajo-social.dto';

export class UpdateEstudioTrabajoSocialDto extends PartialType(
  CreateEstudioTrabajoSocialDto,
) {}

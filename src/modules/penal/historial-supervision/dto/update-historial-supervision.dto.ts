import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialSupervisionDto } from './create-historial-supervision.dto';

export class UpdateHistorialSupervisionDto extends PartialType(
  CreateHistorialSupervisionDto,
) {}

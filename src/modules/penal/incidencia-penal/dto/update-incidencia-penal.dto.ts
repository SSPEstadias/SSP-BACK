import { PartialType } from '@nestjs/swagger';
import { CreateIncidenciaPenalDto } from './create-incidencia-penal.dto';

export class UpdateIncidenciaPenalDto extends PartialType(
  CreateIncidenciaPenalDto,
) {}

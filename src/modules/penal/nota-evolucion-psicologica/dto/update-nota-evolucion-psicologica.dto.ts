import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaEvolucionPsicologicaDto } from './create-nota-evolucion-psicologica.dto';

export class UpdateNotaEvolucionPsicologicaDto extends PartialType(
  CreateNotaEvolucionPsicologicaDto,
) {}

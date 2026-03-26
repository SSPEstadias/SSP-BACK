import { PartialType } from '@nestjs/mapped-types';
import { CreateFichaSeguimientoDto } from './create-ficha-seguimiento.dto';

export class UpdateFichaSeguimientoDto extends PartialType(
  CreateFichaSeguimientoDto,
) {}

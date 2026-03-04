import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonaDto } from './create-persona.dto';

// PartialType hace todos los campos opcionales automáticamente
// y hereda todas las validaciones del CreatePersonaDto
export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {}
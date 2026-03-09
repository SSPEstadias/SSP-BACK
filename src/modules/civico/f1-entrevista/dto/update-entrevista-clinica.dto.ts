import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrevistaClinicaDto } from './create-entrevista-clinica.dto';

export class UpdateEntrevistaClinicaDto extends PartialType(CreateEntrevistaClinicaDto) {}
import { PartialType } from '@nestjs/mapped-types';
import { CreatePenalDto } from './create-penal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PenalEstatusExpediente } from '../entities/penal.entity';

export class UpdatePenalDto extends PartialType(CreatePenalDto) {
  @IsOptional()
  @IsEnum(PenalEstatusExpediente)
  estatus?: PenalEstatusExpediente;
}

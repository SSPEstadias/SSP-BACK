import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EstatusSupervision } from '../entities/historial-supervision.entity';

export class CreateHistorialSupervisionDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  @Min(1)
  mes: number;

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsEnum(EstatusSupervision)
  estatus?: EstatusSupervision;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

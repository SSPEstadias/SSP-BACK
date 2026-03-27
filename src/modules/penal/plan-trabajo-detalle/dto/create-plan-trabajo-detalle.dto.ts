import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstatusPlanTrabajoDetalle } from '../entities/plan-trabajo-detalle.entity';

export class CreatePlanTrabajoDetalleDto {
  @IsInt()
  planTrabajoId: number;

  @IsInt()
  actividadId: number;

  @IsOptional()
  @IsEnum(EstatusPlanTrabajoDetalle)
  estatus?: EstatusPlanTrabajoDetalle;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsString()
  cumplimiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fechaAsignacion?: string;

  @IsOptional()
  @IsDateString()
  fechaCumplimiento?: string;
}

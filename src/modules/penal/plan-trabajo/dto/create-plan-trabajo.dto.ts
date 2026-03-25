import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlanTrabajoDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  guiaId: number;

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsObject()
  datosJsonb: Record<string, any>;
}

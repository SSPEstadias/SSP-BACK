import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFichaSeguimientoDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  guiaId: number;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsObject()
  datosPersonalesJsonb: Record<string, any>;

  @IsOptional()
  @IsString()
  cumplimientoGeneral?: string;

  @IsOptional()
  @IsString()
  comportamiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsObject()
  incidenciasJsonb?: Record<string, any>;

  @IsOptional()
  @IsString()
  recomendaciones?: string;
}

import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFichaSeguimientoDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  guiaId: number;

  @IsDateString()
  fecha: string;

  @IsString()
  @MaxLength(50)
  periodo: string;

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

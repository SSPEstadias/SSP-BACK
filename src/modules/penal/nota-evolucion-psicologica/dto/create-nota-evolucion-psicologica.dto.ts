import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateNotaEvolucionPsicologicaDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  psicologoId: number;

  @IsDateString()
  fecha: string;

  @IsInt()
  @Min(1)
  numeroSesion: number;

  @IsOptional()
  @IsString()
  objetivoSesion?: string;

  @IsOptional()
  @IsString()
  descripcionSesion?: string;

  @IsOptional()
  @IsString()
  tecnicasAplicadas?: string;

  @IsOptional()
  @IsString()
  avances?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  proximaSesion?: string;
}

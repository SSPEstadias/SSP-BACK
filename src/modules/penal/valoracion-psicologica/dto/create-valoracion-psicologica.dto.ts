import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateValoracionPsicologicaDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  psicologoId: number;

  @IsDateString()
  fechaEstudio: string;

  @IsOptional()
  @IsString()
  motivoValoracion?: string;

  @IsObject()
  seccionesJsonb: Record<string, any>;

  @IsOptional()
  @IsString()
  observacionesGenerales?: string;

  @IsOptional()
  @IsObject()
  resultadosPruebas?: Record<string, any>;

  @IsOptional()
  @IsObject()
  accionDerivada?: Record<string, any>;
}

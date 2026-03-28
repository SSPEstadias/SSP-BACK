import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  EstatusIncidenciaPenal,
  GravedadIncidenciaPenal,
  TipoIncidenciaPenal,
} from '../entities/incidencia-penal.entity';

export class CreateIncidenciaPenalDto {
  @IsInt()
  @Min(1)
  expedienteId: number;

  @IsInt()
  @Min(1)
  registradoPorId: number;

  @IsDateString()
  fecha: string;

  @IsEnum(TipoIncidenciaPenal)
  tipo: TipoIncidenciaPenal;

  @IsOptional()
  @IsEnum(GravedadIncidenciaPenal)
  gravedad?: GravedadIncidenciaPenal;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsOptional()
  @IsString()
  accionesTomadas?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  reincidencia?: boolean;

  @IsOptional()
  @IsEnum(EstatusIncidenciaPenal)
  estatus?: EstatusIncidenciaPenal;
}

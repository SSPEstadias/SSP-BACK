import { IsInt, IsBoolean, IsString, IsOptional,IsArray,IsEnum } from 'class-validator';
import { ActividadCategoriaEnum } from '../../actividades/actividad.entity';

export class UpdateSaludDto {
  @IsOptional()
  @IsBoolean()
  esAptoFisico?: boolean;

  @IsOptional()
  @IsBoolean()
  padecEnfermedad?: boolean;

  @IsOptional()
  @IsString()
  nombreEnfermedad?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ActividadCategoriaEnum, { each: true })
  restriccionesCategorias?: string[];

  @IsOptional()
  @IsBoolean()
  consumeSustancias?: boolean;

  @IsOptional()
  @IsString()
  tipoSustancias?: string;

  @IsOptional()
  @IsString()
  afiliadoServicioSalud?: string;

  @IsOptional()
  @IsBoolean()
  necesitaLentes?: boolean;

  @IsOptional()
  @IsString()
  observacionesMedicas?: string;
}

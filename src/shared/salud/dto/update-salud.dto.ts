import { IsInt, IsBoolean, IsString, IsOptional } from 'class-validator';

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

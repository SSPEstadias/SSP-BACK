import { IsInt, IsBoolean, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSaludDto {
  @IsNotEmpty({ message: 'El ID del beneficiario es obligatorio' })
  @IsInt()
  beneficiarioId!: number;

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

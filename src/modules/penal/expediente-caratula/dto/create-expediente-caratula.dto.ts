import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateExpedienteCaratulaDto {
  @IsInt()
  expedienteId: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsString()
  juzgado?: string;

  @IsOptional()
  @IsString()
  delito?: string;

  @IsOptional()
  @IsString()
  agraviado?: string;

  @IsOptional()
  @IsDateString()
  fechaIngresoPrograma?: string;

  @IsOptional()
  @IsDateString()
  fechaSuspensionProceso?: string;

  @IsOptional()
  @IsDateString()
  fechaFinSupervision?: string;

  @IsOptional()
  @IsString()
  medidaCautelar?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

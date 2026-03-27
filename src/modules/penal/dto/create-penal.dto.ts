import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePenalDto {
  @IsInt()
  beneficiarioId: number;

  @IsOptional()
  @IsString()
  cPenal?: string;

  @IsOptional()
  @IsString()
  expedienteTecnico?: string;

  @IsOptional()
  @IsString()
  folioExpediente?: string;

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

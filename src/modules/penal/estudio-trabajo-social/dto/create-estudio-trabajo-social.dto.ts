import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEstudioTrabajoSocialDto {
  @IsInt()
  expedienteId: number;

  @IsInt()
  trabajadorSocialId: number;

  @IsDateString()
  fechaEstudio: string;

  @IsObject()
  seccionesJsonb: Record<string, any>;

  @IsOptional()
  @IsString()
  opinionPrograma?: string;

  @IsOptional()
  @IsString()
  diagnosticoSocial?: string;
}

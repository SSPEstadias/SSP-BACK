import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsNumber,
  IsUUID,
  IsNotEmpty,
  Max,
  Min,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { AsistenciaEnum, IncidenciaTipoEnum } from '../../enums/civico.enums';

export class CreateBitacoraCivicaDto {
  // ── Relaciones ────────────────────────────────────────────────────
  @IsUUID()
  expedienteId!: string;

  @IsInt()
  guiaId!: number;

  @IsInt()
  @IsOptional()
  actividadId!: number;

  // ── Datos del registro ────────────────────────────────────────────
  @IsDateString()
  fechaActividad!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(8) // RF: máximo 8 horas diarias (CHECK del DDL)
  horasCubiertas!: number;

  @IsEnum(AsistenciaEnum)
  asistencia!: AsistenciaEnum;

  @IsEnum(IncidenciaTipoEnum)
  @IsOptional()
  incidencia?: IncidenciaTipoEnum;

  @IsString()
  @IsOptional()
  detalleIncidencia?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

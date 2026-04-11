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
import { ApiProperty } from '@nestjs/swagger';

export class CreateBitacoraCivicaDto {
  // ── Relaciones ────────────────────────────────────────────────────
  @ApiProperty({ description: 'UUID del expediente', example: '8c478ea9-fbcb-452d-90f6-e689a2590fd6' })
  @IsUUID()
  expedienteId!: string;

  @ApiProperty({ description: 'ID del guía que registra (debe tener rol "guia")', example: 4 })
  @IsInt()
  guiaId!: number;

  @ApiProperty({ description: 'ID de la actividad programada (opcional)', example: 1, required: false })
  @IsInt()
  @IsOptional()
  actividadId!: number;

  // ── Datos del registro ────────────────────────────────────────────
  @ApiProperty({ description: 'Fecha de la actividad', example: '2025-04-07' })
  @IsDateString()
  fechaActividad!: string;

  @ApiProperty({ description: 'Horas cubiertas en el día', example: 4.5, minimum: 0, maximum: 8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(8) // RF: máximo 8 horas diarias (CHECK del DDL)
  horasCubiertas!: number;

  @ApiProperty({ enum: AsistenciaEnum, example: AsistenciaEnum.PRESENTE })
  @IsEnum(AsistenciaEnum)
  asistencia!: AsistenciaEnum;

  @ApiProperty({ enum: IncidenciaTipoEnum, required: false, nullable: true })
  @IsEnum(IncidenciaTipoEnum)
  @IsOptional()
  incidencia?: IncidenciaTipoEnum;

  @ApiProperty({ description: 'Detalle de la incidencia (obligatorio si hay incidencia)', required: false })
  @IsString()
  @IsOptional()
  detalleIncidencia?: string;

  @ApiProperty({ description: 'Lugar/Sede de la actividad', example: 'Centro Comunitario Oriente', required: false })
  @IsString()
  @IsOptional()
  sede?: string;

  @ApiProperty({ description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({
    description: 'URL de la evidencia (Link de Drive, Foto, etc.). ⚠️ IMPORTANTE: Usar este nombre de campo exacto.',
    example: 'https://drive.google.com/file/d/123/view',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  evidenciaUrl?: string;
}

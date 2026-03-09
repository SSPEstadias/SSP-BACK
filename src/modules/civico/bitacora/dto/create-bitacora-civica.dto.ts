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
  } from 'class-validator';
  
  export class CreateBitacoraCivicaDto {
    // ── Relaciones ────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    guiaId!: number;
  
    @IsInt()
    actividadId!: number;
  
    // ── Datos del registro ────────────────────────────────────────────
    @IsDateString()
    fechaActividad!: string;
  
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.1)
    @Max(8)  // RF: máximo 8 horas diarias (CHECK del DDL)
    horasCubiertas!: number;
  
    @IsBoolean()
    @IsOptional()
    asistencia?: boolean;
  
    @IsString()
    @IsOptional()
    motivoFalta?: string;
  
    @IsString()
    @IsOptional()
    @IsUrl()
    evidenciaUrl?: string;
  }
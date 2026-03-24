import {
    IsString,
    IsInt,
    IsBoolean,
    IsOptional,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsUUID,
    MaxLength,
  } from 'class-validator';
  import { IncidenciaTipoEnum, IncidenciaEstatusEnum } from '../../enums/civico.enums';
  
  export class CreateIncidenciaDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    guiaId!: number;
  
    // ── Datos ──────────────────────────────────────────────────────────
    @IsEnum(IncidenciaTipoEnum)
    tipo!: IncidenciaTipoEnum;
  
    @IsDateString()
    @IsNotEmpty()
    fechaIncidencia!: string;
  
  
    @IsString()
    @IsOptional()
    descripcionHechos?: string;  
  
    // TRUE = suma al conteo de strikes para baja automática (RF-013)
    @IsBoolean()
    @IsOptional()
    esAcumulativa?: boolean;
  
    @IsEnum(IncidenciaEstatusEnum)
    @IsOptional()
    estatusResolucion?: IncidenciaEstatusEnum;
  
    @IsString()
    @IsOptional()
    @MaxLength(80)
    numOficioNotificacion?: string;
  }
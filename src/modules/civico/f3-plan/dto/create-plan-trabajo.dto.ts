import {
    IsString,
    IsInt,
    IsOptional,
    IsDateString,
    IsEnum,
    IsObject,
    IsNotEmpty,
    IsUUID,
  } from 'class-validator';
  import { FormStatusEnum } from '../../enums/civico.enums';
  
  export class CreatePlanTrabajoDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    coordinadorId!: number;
  
    // ── Fechas ─────────────────────────────────────────────────────────
    @IsDateString()
    fechaInicioEstimada!: string;
  
    @IsDateString()
    fechaTerminoEstimada!: string;
  
    @IsString()
    @IsOptional()
    diasAsignados?: string;
  
    // ── Contenido ─────────────────────────────────────────────────────
    @IsObject()
    @IsOptional()
    proyectoVidaF3?: object;
    // Ejemplo: { "personal":"...", "familiar":"...", "social":"..." }
  
    @IsString()
    @IsOptional()
    metasPrograma?: string;
  
    @IsObject()
    @IsNotEmpty()
    actividadesPlan!: object;
    // Ejemplo:
    // {
    //   "EDUCATIVA":  {"estatus":"PENDIENTE","objetivo":"...","cumplimiento":""},
    //   "LABORAL":    {"estatus":"PENDIENTE","objetivo":"...","cumplimiento":""},
    //   ...
    // }
  
    @IsString()
    @IsOptional()
    observacionesPlan?: string;
  
    // ── Control ────────────────────────────────────────────────────────
    @IsEnum(FormStatusEnum)
    @IsOptional()
    estatusF3?: FormStatusEnum;
  }
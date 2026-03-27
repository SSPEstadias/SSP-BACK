import {
    IsInt,
    IsOptional,
    IsEnum,
    IsObject,
    IsNotEmpty,
    IsUUID,
    IsString,
  } from 'class-validator';
  import { FormStatusEnum } from '../../enums/civico.enums';
  
  export class CreateCedulaInicialDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    coordinadorId!: number;
  
    // ── Proceso de Ingreso (texto libre) ───────────────────────────────
    @IsString()
    @IsOptional()
    procesoIngreso?: string;
  
    // ── Seguimiento 5 categorías JSONB ─────────────────────────────────
    // { "EDUCATIVA": "...", "LABORAL": "...", "FAMILIAR": "...", "DEPORTIVO": "...", "CULTURAL": "..." }
    @IsObject()
    @IsOptional()
    seguimientoActividades?: Record<string, string>;
  
    // ── Control ────────────────────────────────────────────────────────
    @IsEnum(FormStatusEnum)
    @IsOptional()
    estatusF4?: FormStatusEnum;
  }
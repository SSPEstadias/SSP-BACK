import {
    IsInt,
    IsOptional,
    IsEnum,
    IsObject,
    IsNotEmpty,
    IsUUID,
    IsString,
    Min,
  } from 'class-validator';
  import { FormStatusEnum } from '../../enums/civico.enums';
  
  export class CreateCedulaInicialDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    coordinadorId!: number;
  
    // ── Datos ──────────────────────────────────────────────────────────
    @IsInt()
    @Min(1)
    horasACubrir!: number;
  
    @IsString()
    @IsOptional()
    modalidadFalta?: string;
  
    // ── Bloques JSONB ──────────────────────────────────────────────────
    @IsObject()
    @IsOptional()
    procesoIngreso?: object;
  
    @IsObject()
    @IsOptional()
    seguimientoActividades?: object;
    // [{ "categoria":"EDUCATIVA", "descripcion":"", "responsable":"", "horario":"" }]
  
    @IsObject()
    @IsOptional()
    proyectoVidaF4?: object;
    // { "personal":"", "familiar":"", "laboral":"", ... }
  
    @IsObject()
    @IsOptional()
    tablaSeguimientoDetallado?: object;
    // 8 categorías — misma estructura que F3.actividadesPlan
  
    // ── Control ────────────────────────────────────────────────────────
    @IsEnum(FormStatusEnum)
    @IsOptional()
    estatusF4?: FormStatusEnum;
  }
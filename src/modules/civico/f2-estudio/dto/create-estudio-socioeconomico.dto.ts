import {
    IsString,
    IsInt,
    IsBoolean,
    IsOptional,
    IsEnum,
    IsObject,
    IsNumber,
    IsUUID,
  } from 'class-validator';
  import { FormStatusEnum } from '../../enums/civico.enums';
  import {
    NivelSocioeconomicoEnum,
    GrupoFamiliarEnum,
  } from '../estudio-socioeconomico.entity';
  
  export class CreateEstudioSocioeconomicoDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    trabajadorSocialId!: number;
  
    // ── Columnas críticas ──────────────────────────────────────────────
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    ingresoMensual?: number;
  
    @IsEnum(NivelSocioeconomicoEnum)
    @IsOptional()
    nivelSocioeconomico?: NivelSocioeconomicoEnum;
  
    @IsEnum(GrupoFamiliarEnum)
    @IsOptional()
    grupoFamiliar?: GrupoFamiliarEnum;
  
    @IsBoolean()
    @IsOptional()
    huboViolenciaIntrafamiliar?: boolean;
  
    @IsString()
    @IsOptional()
    diagnosticoSocial?: string;
  
    // ── Bloques JSONB ──────────────────────────────────────────────────
    @IsObject()
    @IsOptional()
    generalesF2?: object;
  
    @IsObject()
    @IsOptional()
    situacionJuridicaF2?: object;
  
    @IsObject()
    @IsOptional()
    nucleoPrimario?: object;
  
    @IsObject()
    @IsOptional()
    nucleoSecundario?: object;
  
    @IsObject()
    @IsOptional()
    datosIndiciado?: object;
  
    @IsObject()
    @IsOptional()
    gruposAutoayuda?: object;
  
    @IsObject()
    @IsOptional()
    opinionObservaciones?: object;
  
    // ── Control ────────────────────────────────────────────────────────
    @IsEnum(FormStatusEnum)
    @IsOptional()
    estatusF2?: FormStatusEnum;
  }
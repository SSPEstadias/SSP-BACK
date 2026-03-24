import {
    IsString,
    IsInt,
    IsBoolean,
    IsOptional,
    IsDateString,
    IsEnum,
    IsObject,
    IsNotEmpty,
    IsUUID,
  } from 'class-validator';
  import { FormStatusEnum } from '../../enums/civico.enums';
  
  export class CreateEntrevistaClinicaDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    psicologoId!: number;
  
    // ── Campos críticos ────────────────────────────────────────────────
    @IsDateString()
    fechaEntrevista!: string;
  
    @IsBoolean()
    consentimientoInformado!: boolean;
  
    @IsBoolean()
    @IsOptional()
    riesgoSuicida?: boolean;
  
    @IsBoolean()
    @IsOptional()
    consumeSustancias?: boolean;
  
    @IsBoolean()
    @IsOptional()
    padeceEnfermedadCronica?: boolean;
  
    @IsBoolean()
    @IsOptional()
    necesitaApoyoPsicologico?: boolean;
  
    // ── Campos clínicos ────────────────────────────────────────────────
    @IsString()
    @IsOptional()
    motivoConsulta?: string;
  
    @IsString()
    @IsOptional()
    antecedentesClinicos?: string;
  
    @IsString()
    @IsOptional()
    examenMental?: string;
  
    @IsString()
    @IsOptional()
    impresionDiagnostica?: string;
  
    // ── Bloques JSONB ──────────────────────────────────────────────────
    @IsObject()
    @IsOptional()
    generalesEntrevista?: object;
  
    @IsObject()
    @IsOptional()
    situacionJuridicaF1?: object;
  
    @IsObject()
    @IsOptional()
    nucleoFamiliarPrimario?: object;
  
    @IsObject()
    @IsOptional()
    sustanciasDetalle?: object;
  
    @IsObject()
    @IsOptional()
    perfilPersonal?: object;
  
    @IsObject()
    @IsOptional()
    saludDetalle?: object;
  
    @IsObject()
    @IsOptional()
    proyectoVida?: object;
  
    // ── Control ────────────────────────────────────────────────────────
    @IsEnum(FormStatusEnum)
    @IsOptional()
    estatusF1?: FormStatusEnum;
  }
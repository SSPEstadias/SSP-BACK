import {
    IsString,
    IsInt,
    IsBoolean,
    IsOptional,
    IsDateString,
    IsEnum,
    IsObject,
    IsNotEmpty,
    MaxLength,
    Min,
  } from 'class-validator';
  import { CivicStatusEnum } from '../../enums/civico.enums';
  
  export class CreateExpedienteCivicoDto {
    // ── Relación Beneficiario ─────────────────────────────────────────
    @IsInt()
    beneficiarioId!: number;
  
    // ── Identidad ─────────────────────────────────────────────────────
    @IsString()
    @IsOptional()
    @MaxLength(18)
    curp!: string;
  
    @IsDateString()
    fechaNacimiento!: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(20)
    genero?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    aliasSobrenombre?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(150)
    originario?: string;
  
    @IsString()
    @IsNotEmpty()
    domicilioCompleto!: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    municipio?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(10)
    codigoPostal?: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(15)
    telefonoContacto?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    escolaridadActual?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(50)
    estadoCivil?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    ocupacionActual?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(50)
    nacionalidad?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    lenguaIndigena?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    religion?: string;
  
    @IsObject()
    @IsNotEmpty()
    contactosFamiliares?: object;
    // Ejemplo: { "padre": {"nombre":"...", "telefono":"..."}, "madre": {...} }
  
    // ── Datos Legales ─────────────────────────────────────────────────
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    folioIncorporacion!: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(50)
    numJuzgadoCivico?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(150)
    juezControl?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(50)
    oficioCanalizacion?: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    causaPenal!: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(150)
    delitoImputado?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(150)
    agraviado?: string;
  
    @IsDateString()
    @IsOptional()
    fechaDetencion?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(100)
    modalidadFalta?: string;
  
    @IsInt()
    @Min(1)
    horasSentencia!: number;
  
    @IsOptional()
    @IsString({ each: true })
    diasAsignadosJuzgado?: string[];
    // Ejemplo: ["2025-08-02", "2025-08-03"]
  
    @IsInt()
    @IsOptional()
    @Min(1)
    horasPorDia?: number;
  
    // ── Fechas del beneficio ─────────────────────────────────────────
    @IsDateString()
    @IsOptional()
    fechaInicioBeneficio?: string;
  
    @IsDateString()
    @IsOptional()
    fechaTerminoBeneficio?: string;
  
    @IsDateString()
    @IsOptional()
    fechaOficioCanalizacion?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(1)
    generoJuez?: string; // "M" o "F"
  
    // ── Control ───────────────────────────────────────────────────────
    @IsEnum(CivicStatusEnum)
    @IsOptional()
    estatusProceso?: CivicStatusEnum;
  
    @IsBoolean()
    @IsOptional()
    esActivo?: boolean;
  }
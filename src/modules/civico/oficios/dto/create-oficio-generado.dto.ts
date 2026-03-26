import {
    IsString,
    IsInt,
    IsBoolean,
    IsOptional,
    IsEnum,
    IsObject,
    IsNotEmpty,
    IsUUID,
    IsUrl,
    MaxLength,
  } from 'class-validator';
  import { TipoDocumentoEnum } from '../../enums/civico.enums';
  
  export class CreateOficioGeneradoDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    generadoPorId!: number;
  
    // ── Datos del documento ────────────────────────────────────────────
    @IsEnum(TipoDocumentoEnum)
    tipoDocumento!: TipoDocumentoEnum;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    folioOficio!: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(150)
    nombreArchivoFederal?: string;
    // Nomenclatura HU-05: CURP_TipoDocumento.pdf
  
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    urlArchivo!: string;
  
    // ── Control de modificaciones ──────────────────────────────────────
    @IsBoolean()
    @IsOptional()
    esModificacion?: boolean;
  
    @IsString()
    @IsOptional()
    motivoModificacion?: string;
  
    // ── Auditoría RNF-003 ──────────────────────────────────────────────
    @IsBoolean()
    @IsOptional()
    esExterno?: boolean;
    // TRUE solo para OFICIO_CANALIZACION
  }
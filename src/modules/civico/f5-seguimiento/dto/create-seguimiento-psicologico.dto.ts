import {
    IsInt,
    IsOptional,
    IsDateString,
    IsString,
    IsUUID,
    IsNotEmpty,
    Min,
    MaxLength,
    Matches,
  } from 'class-validator';
  
  export class CreateSeguimientoPsicologicoDto {
    // ── Relaciones ─────────────────────────────────────────────────────
    @IsUUID()
    expedienteId!: string;
  
    @IsInt()
    psicologoId!: number;
  
    // ── Datos de la sesión ─────────────────────────────────────────────
    @IsInt()
    @Min(1)
    numSesion!: number;
  
    @IsDateString()
    fechaSesion!: string;
  
    @IsString()
    @IsOptional()
    @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
      message: 'horaSesion debe tener formato HH:MM o HH:MM:SS',
    })
    horaSesion?: string;
  
    @IsDateString()
    @IsOptional()
    fechaProximaSesion?: string;
  
    // ── Contenido clínico ──────────────────────────────────────────────
    @IsString()
    @IsOptional()
    objetivoSesion?: string;
  
    @IsString()
    @IsOptional()
    conductaDisposicion?: string;
  
    @IsString()
    @IsOptional()
    descripcionIntervencion?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(150)
    temaSesion?: string;
  
    @IsString()
    @IsOptional()
    estrategiaAplicada?: string;
  
    @IsString()
    @IsOptional()
    planTerapeutico?: string;
  
    @IsString()
    @IsOptional()
    actividadesAsignadasUsuario?: string;
  
    @IsString()
    @IsOptional()
    @MaxLength(50)
    avancePercibido?: string;
  
    @IsString()
    @IsOptional()
    observaciones?: string;
  }
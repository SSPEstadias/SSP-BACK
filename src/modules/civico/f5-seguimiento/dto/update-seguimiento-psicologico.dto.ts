import {
    IsString,
    IsOptional,
    MaxLength,
  } from 'class-validator';
  
  export class UpdateSeguimientoPsicologicoDto {
    @IsString()
    @IsOptional()
    @MaxLength(150)
    temaSesion?: string;
  
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
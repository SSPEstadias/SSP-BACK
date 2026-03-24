import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreatePersonaDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  folio?: string;

  // ─── I. Generales ────────────────────────────────────────────
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sobrenombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  edad?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(18)
  curp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lugarOrigen?: string;

  @IsOptional()
  @IsString()
  motivoIngreso?: string;

  @IsOptional()
  @IsDateString()
  fechaInicioTratamiento?: string;

  @IsOptional()
  @IsDateString()
  fechaTerminoTratamiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  religion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  practicaDeporte?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cualDeporte?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  pasatiempo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  tieneActaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lugarNacimientoRegistro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  personasRegistraron?: string;

  // ─── II. Escolaridad ─────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sabeLeerEscribir?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gradoMaximoEstudios?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  leGustariaEstudiar?: string;

  @IsOptional()
  @IsBoolean()
  certificadoPrimaria?: boolean;

  @IsOptional()
  @IsBoolean()
  certificadoSecundaria?: boolean;

  @IsOptional()
  @IsBoolean()
  certificadoBachillerato?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombrePlantel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccionPlantel?: string;

  @IsOptional()
  @IsDateString()
  fechaTerminoPlantel?: string;

  // ─── III. Laboral ────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(10)
  trabajaFormal?: string;

  @IsOptional()
  @IsString()
  funcionesTrabajo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  leGustariaCambiarTrabajo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sabeOficio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  leGustariaAprenderOficio?: string;

  // ─── IV. Salud ───────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(255)
  padecimientoEnfermedad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  servicioSalud?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cuentaTratamiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  enfermedadTransmisionSexual?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  necesitaLentes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  atencionPsicologica?: string;

  // ─── Contactos ───────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contacto1Nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contacto1Relacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contacto1Telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contacto2Nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contacto2Relacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contacto2Telefono?: string;

  // ─── Estado ──────────────────────────────────────────────────
  @IsOptional()
  @IsIn(['Activo', 'Inactivo'])
  estado?: 'Activo' | 'Inactivo';
}
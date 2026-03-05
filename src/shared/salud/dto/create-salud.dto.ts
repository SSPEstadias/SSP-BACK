import { IsInt, IsBoolean, IsString, IsOptional, IsNotEmpty, IsArray,IsEnum} from 'class-validator';
import { ActividadCategoriaEnum } from '../../actividades/actividad.entity';

export class CreateSaludDto {
  @IsNotEmpty({ message: 'El ID del beneficiario es obligatorio' })
  @IsInt()
  beneficiarioId!: number;

  @IsOptional()
  @IsBoolean()
  esAptoFisico?: boolean;

  @IsOptional()
  @IsBoolean()
  padecEnfermedad?: boolean;

  @IsOptional()
  @IsString()
  nombreEnfermedad?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ActividadCategoriaEnum, { each: true })
  restriccionesCategorias?: string[];

  @IsOptional()
  @IsBoolean()
  consumeSustancias?: boolean;

  @IsOptional()
  @IsString()
  tipoSustancias?: string;

  @IsOptional()
  @IsString()
  afiliadoServicioSalud?: string;

  @IsOptional()
  @IsBoolean()
  necesitaLentes?: boolean;

  @IsOptional()
  @IsString()
  observacionesMedicas?: string;
}

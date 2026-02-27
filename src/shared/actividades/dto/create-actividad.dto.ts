import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ActividadCategoriaEnum } from '../actividad.entity';

export class CreateActividadDto {

  @IsNotEmpty({ message: 'El nombre de la actividad es obligatorio' })
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsEnum(ActividadCategoriaEnum, {
    message: 'Categoría inválida',
  })
  categoria?: ActividadCategoriaEnum;
}
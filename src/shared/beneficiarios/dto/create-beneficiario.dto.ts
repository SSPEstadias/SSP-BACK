import { IsString, IsInt, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { UnidadTiempoEnum } from '../beneficiario.entity';

export class CreateBeneficiarioDto {

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre!: string;

  @IsNotEmpty({ message: 'El tiempo asignado es obligatorio' })
  @IsInt()
  @Min(1, { message: 'El tiempo asignado debe ser mayor a 0' })
  tiempoAsignado!: number;

  @IsNotEmpty({ message: 'La unidad de tiempo es obligatoria' })
  @IsEnum(UnidadTiempoEnum, {
    message: 'La unidad de tiempo debe ser HORAS o MESES',
  })
  unidadTiempo!: UnidadTiempoEnum;
}
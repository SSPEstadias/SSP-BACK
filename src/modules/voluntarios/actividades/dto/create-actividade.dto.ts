import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateActividadDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nombreActividad: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  impartidor: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  responsable: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lugar: string;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numParticipantes?: number;

  @IsOptional()
  @IsIn(['Se llevó a cabo', 'No se llevó a cabo'])
  estado?: 'Se llevó a cabo' | 'No se llevó a cabo';

  @IsOptional()
  @IsString()
  descripcion?: string;
}
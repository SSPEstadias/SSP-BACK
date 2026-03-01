import { IsEnum, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @IsString()
  nom_usuario: string;

  @IsString()
  @MinLength(6)
  contrasena: string;
}

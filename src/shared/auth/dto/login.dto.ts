import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  nomUsuario: string;  // camelCase

  @IsNotEmpty()
  @IsString()
  contrasena: string;
}
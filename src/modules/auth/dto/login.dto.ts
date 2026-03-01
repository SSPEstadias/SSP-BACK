import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  nom_usuario: string;

  @IsString()
  contrasena: string;
}

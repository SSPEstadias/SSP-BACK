import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(nomUsuario: string, contrasena: string) {
    const user = await this.usersService.findByUsername(nomUsuario);

    if (!user || !user.estatus) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    // Payload que viaja dentro del token JWT
    const payload = {
      sub:        user.id,
      rol:        user.rol,          // ej: "Admin", "Guia"
      nomUsuario: user.nomUsuario,   // camelCase
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id:        user.id,
        nombre:    user.nombre,
        rol:       user.rol,
        nomUsuario: user.nomUsuario,
      },
    };
  }
}
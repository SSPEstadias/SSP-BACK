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

  async login(nom_usuario: string, contrasena: string) {
    const user = await this.usersService.findByUsername(nom_usuario);

    if (!user || !user.estatus) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const payload = {
      sub: user.id,
      rol: user.rol,
      nom_usuario: user.nom_usuario,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        nom_usuario: user.nom_usuario,
      },
    };
  }
}

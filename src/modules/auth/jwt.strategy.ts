import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev_secret_change_me',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // lo que regresa aquí se asigna a req.user
    return {
      userId: payload.sub,
      rol: payload.rol,
      nom_usuario: payload.nom_usuario,
    };
  }
}

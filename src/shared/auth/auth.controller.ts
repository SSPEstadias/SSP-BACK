import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('🔐 Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nomUsuario: { type: 'string', example: 'admin' },
        contrasena: { type: 'string', example: 'Admin1234' },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.nomUsuario, dto.contrasena);
  }
}
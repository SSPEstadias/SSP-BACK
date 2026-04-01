import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('🔐 Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión y obtener token JWT',
    description:
      'Autentica al usuario y retorna un `access_token` JWT con duración de 8 horas. ' +
      'Copia el token y úsalo en el botón 🔒 **Authorize** para todas las rutas protegidas.',
  })
  @ApiBody({
    description: 'Credenciales del usuario del sistema',
    examples: {
      admin: {
        summary: 'Login como Administrador',
        value: { nomUsuario: 'admin', contrasena: 'Admin1234' },
      },
      psicologo: {
        summary: 'Login como Psicólogo',
        value: { nomUsuario: 'psico_ana', contrasena: 'Admin1234' },
      },
      trabajo_social: {
        summary: 'Login como Trabajo Social',
        value: { nomUsuario: 'social_pedro', contrasena: 'Admin1234' },
      },
      guia: {
        summary: 'Login como Guía',
        value: { nomUsuario: 'guia_roberto', contrasena: 'Admin1234' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Copia el access_token para autorizar el resto de endpoints.',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbCI6ImFkbWluIiwibm9tVXN1YXJpbyI6ImFkbWluIiwiaWF0IjoxNzQzNTI3MDAwLCJleHAiOjE3NDM1NTU4MDB9.exampleSignature',
        },
        userId: { type: 'number', example: 1 },
        rol: { type: 'string', example: 'admin' },
        nombre: { type: 'string', example: 'Administrador del Sistema' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.nomUsuario, dto.contrasena);
  }
}
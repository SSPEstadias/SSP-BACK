import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('👤 Usuarios')
@ApiBearerAuth('JWT-Auth')

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo usuario del sistema [Solo Admin]',
    description:
      'Crea un usuario con uno de los 4 roles disponibles. ' +
      'Los IDs retornados (`id`) se usan en las fases posteriores del flujo ' +
      '(psicologoId en F1/F5, trabajadorSocialId en F2, guiaId en Bitácora e Incidencias). ' +
      '**Roles válidos:** `admin`, `psicologo`, `trabajo_social`, `guia`.',
  })
  @ApiBody({
    description: 'Datos del nuevo usuario. Todos los campos son obligatorios.',
    examples: {
      admin: {
        summary: '(Fase 0-A) Crear Administrador secundario',
        value: { nomUsuario: 'admin_secundario', nombre: 'Admin de Apoyo', rol: 'admin', contrasena: 'Admin1234' },
      },
      psicologo: {
        summary: '(Fase 0-B) Crear Psicólogo → guarda psicologoId',
        value: { nomUsuario: 'psico_ana', nombre: 'Ana García Psicóloga', rol: 'psicologo', contrasena: 'Admin1234' },
      },
      trabajo_social: {
        summary: '(Fase 0-C) Crear Trabajador Social → guarda trabajadorSocialId',
        value: { nomUsuario: 'social_pedro', nombre: 'Pedro Ramírez T. Social', rol: 'trabajo_social', contrasena: 'Admin1234' },
      },
      guia: {
        summary: '(Fase 0-D) Crear Guía de Campo → guarda guiaId',
        value: { nomUsuario: 'guia_roberto', nombre: 'Roberto Sánchez Guía', rol: 'guia', contrasena: 'Admin1234' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente. Guarda el campo `id` para usarlo en las siguientes fases.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 2, description: 'ID del usuario (usar como psicologoId / trabajadorSocialId / guiaId)' },
        nombre: { type: 'string', example: 'Ana García Psicóloga' },
        rol: { type: 'string', example: 'psicologo', enum: ['admin', 'psicologo', 'trabajo_social', 'guia'] },
        nomUsuario: { type: 'string', example: 'psico_ana' },
        estatus: { type: 'boolean', example: true },
        creadoEn: { type: 'string', format: 'date-time', example: '2025-04-01T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'El nomUsuario ya existe en el sistema' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — Solo Admin puede crear usuarios' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios del sistema [Solo Admin]' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los usuarios registrados en el sistema',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          nombre: { type: 'string', example: 'Administrador del Sistema' },
          rol: { type: 'string', example: 'admin' },
          nomUsuario: { type: 'string', example: 'admin' },
          estatus: { type: 'boolean', example: true },
          creadoEn: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findAll() {
    return this.usersService.findAll();
  }
}

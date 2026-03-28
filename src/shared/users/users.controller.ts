import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('👤 Usuarios')
@ApiBearerAuth('JWT-Auth')

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario del sistema' })
  @ApiBody({
    schema: {
      type: 'object',
      examples: {
        admin: {
          summary: 'Crear otro Administrador',
          value: { nomUsuario: 'admin_secundario', nombre: 'Admin de Apoyo', rol: 'admin', contrasena: 'Admin1234' }
        },
        psicologo: {
          summary: 'Crear Psicólogo',
          value: { nomUsuario: 'psico_ana', nombre: 'Ana Psicologa', rol: 'psicologo', contrasena: 'Admin1234' }
        },
        trabajo_social: {
          summary: 'Crear Trabajo Social',
          value: { nomUsuario: 'social_pedro', nombre: 'Pedro Social', rol: 'trabajo_social', contrasena: 'Admin1234' }
        },
        guia: {
          summary: 'Crear Guía de Campo',
          value: { nomUsuario: 'guia_roberto', nombre: 'Roberto Guia', rol: 'guia', contrasena: 'Admin1234' }
        }
      }
    }
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}

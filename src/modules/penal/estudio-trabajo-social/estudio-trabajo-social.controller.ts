import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EstudioTrabajoSocialService } from './estudio-trabajo-social.service';
import { CreateEstudioTrabajoSocialDto } from './dto/create-estudio-trabajo-social.dto';
import { UpdateEstudioTrabajoSocialDto } from './dto/update-estudio-trabajo-social.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';
import { EstudioTrabajoSocial } from './entities/estudio-trabajo-social.entity';

@Controller('penal/estudio-trabajo-social')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstudioTrabajoSocialController {
  constructor(private readonly estudioService: EstudioTrabajoSocialService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.TRABAJO_SOCIAL)
  @Post()
  create(
    @Body() dto: CreateEstudioTrabajoSocialDto,
  ): Promise<EstudioTrabajoSocial> {
    return this.estudioService.create(dto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.PSICOLOGO,
    RolUsuario.GUIA,
  )
  @Get()
  findAll(): Promise<EstudioTrabajoSocial[]> {
    return this.estudioService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.PSICOLOGO,
    RolUsuario.GUIA,
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EstudioTrabajoSocial> {
    return this.estudioService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.PSICOLOGO,
    RolUsuario.GUIA,
  )
  @Get('expediente/:expedienteId')
  findByExpediente(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
  ): Promise<EstudioTrabajoSocial> {
    return this.estudioService.findByExpediente(expedienteId);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.TRABAJO_SOCIAL)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstudioTrabajoSocialDto,
  ): Promise<EstudioTrabajoSocial> {
    return this.estudioService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estudioService.remove(id);
  }
}

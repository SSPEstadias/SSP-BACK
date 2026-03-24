import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PenalService } from './penal.service';
import { CreatePenalDto } from './dto/create-penal.dto';
import { UpdatePenalDto } from './dto/update-penal.dto';
import { PenalExpediente } from './entities/penal.entity';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/common/guards/roles.guard';
import { Roles } from '../../shared/common/decorators/roles.decorator';
import { RolUsuario } from 'src/shared/users/entities/user.entity';

@Controller('penal/expedientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenalController {
  constructor(private readonly penalService: PenalService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  create(@Body() createPenalDto: CreatePenalDto): Promise<PenalExpediente> {
    return this.penalService.create(createPenalDto);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get()
  findAll(): Promise<PenalExpediente[]> {
    return this.penalService.findAll();
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PenalExpediente> {
    return this.penalService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePenalDto: UpdatePenalDto,
  ): Promise<PenalExpediente> {
    return this.penalService.update(id, updatePenalDto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.penalService.remove(id);
  }
}

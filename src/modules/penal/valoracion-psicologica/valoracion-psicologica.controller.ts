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
import { ValoracionPsicologicaService } from './valoracion-psicologica.service';
import { CreateValoracionPsicologicaDto } from './dto/create-valoracion-psicologica.dto';
import { UpdateValoracionPsicologicaDto } from './dto/update-valoracion-psicologica.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { ValoracionPsicologica } from './entities/valoracion-psicologica.entity';

@Controller('penal/valoracion-psicologica')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ValoracionPsicologicaController {
  constructor(
    private readonly valoracionService: ValoracionPsicologicaService,
  ) {}

  @Roles('admin', 'psicologo')
  @Post()
  create(
    @Body() dto: CreateValoracionPsicologicaDto,
  ): Promise<ValoracionPsicologica> {
    return this.valoracionService.create(dto);
  }

  @Roles('admin', 'psicologo')
  @Get()
  findAll(): Promise<ValoracionPsicologica[]> {
    return this.valoracionService.findAll();
  }

  @Roles('admin', 'psicologo')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ValoracionPsicologica> {
    return this.valoracionService.findOne(id);
  }

  @Roles('admin', 'psicologo')
  @Get('expediente/:expedienteId')
  findByExpediente(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
  ): Promise<ValoracionPsicologica> {
    return this.valoracionService.findByExpediente(expedienteId);
  }

  @Roles('admin', 'psicologo')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValoracionPsicologicaDto,
  ): Promise<ValoracionPsicologica> {
    return this.valoracionService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.valoracionService.remove(id);
  }
}

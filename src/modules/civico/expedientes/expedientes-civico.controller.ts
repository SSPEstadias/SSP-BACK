import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ExpedientesCivicoService } from './expedientes-civico.service';
import { CreateExpedienteCivicoDto } from './dto/create-expediente-civico.dto';
import { UpdateExpedienteCivicoDto } from './dto/update-expediente-civico.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/expedientes')
export class ExpedientesCivicoController {
  constructor(private readonly service: ExpedientesCivicoService) {}

  // POST /civico/expedientes
  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateExpedienteCivicoDto) {
    return this.service.create(dto);
  }

  // GET /civico/expedientes
  @Get()
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findAll() {
    return this.service.findAll();
  }

  // GET /civico/expedientes/:id
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // GET /civico/expedientes/curp/:curp
  @Get('curp/:curp')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  findByCurp(@Param('curp') curp: string) {
    return this.service.findByCurp(curp);
  }

  // PATCH /civico/expedientes/:id
  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpedienteCivicoDto,
  ) {
    return this.service.update(id, dto);
  }

  // DELETE /civico/expedientes/:id  → baja lógica
  @Delete(':id')
  @Roles('Admin')
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deactivate(id);
  }
}

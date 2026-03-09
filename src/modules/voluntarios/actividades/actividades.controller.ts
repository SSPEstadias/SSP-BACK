import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividade.dto';
import { UpdateActividadDto } from './dto/update-actividade.dto';

@Controller('voluntarios/actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  // POST /actividades
  @Post()
  create(@Body() createActividadDto: CreateActividadDto) {
    return this.actividadesService.create(createActividadDto);
  }

  // GET /actividades
  @Get()
  findAll() {
    return this.actividadesService.findAll();
  }

  // GET /actividades/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(id);
  }

  // PUT /actividades/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updateActividadDto: UpdateActividadDto) {
    return this.actividadesService.update(id, updateActividadDto);
  }

  // DELETE /actividades/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }
}
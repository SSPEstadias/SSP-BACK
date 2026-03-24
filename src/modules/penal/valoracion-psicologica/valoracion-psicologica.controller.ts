import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ValoracionPsicologicaService } from './valoracion-psicologica.service';
import { CreateValoracionPsicologicaDto } from './dto/create-valoracion-psicologica.dto';
import { UpdateValoracionPsicologicaDto } from './dto/update-valoracion-psicologica.dto';

@Controller('valoracion-psicologica')
export class ValoracionPsicologicaController {
  constructor(private readonly valoracionPsicologicaService: ValoracionPsicologicaService) {}

  @Post()
  create(@Body() createValoracionPsicologicaDto: CreateValoracionPsicologicaDto) {
    return this.valoracionPsicologicaService.create(createValoracionPsicologicaDto);
  }

  @Get()
  findAll() {
    return this.valoracionPsicologicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.valoracionPsicologicaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateValoracionPsicologicaDto: UpdateValoracionPsicologicaDto) {
    return this.valoracionPsicologicaService.update(+id, updateValoracionPsicologicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.valoracionPsicologicaService.remove(+id);
  }
}

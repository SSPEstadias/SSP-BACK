import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Controller('voluntarios/personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  // POST /api/personas
  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  // GET /api/personas
  @Get()
  findAll() {
    return this.personasService.findAll();
  }

  // GET /api/personas/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  // PUT /api/personas/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  // DELETE /api/personas/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
import { Injectable } from '@nestjs/common';
import { CreateValoracionPsicologicaDto } from './dto/create-valoracion-psicologica.dto';
import { UpdateValoracionPsicologicaDto } from './dto/update-valoracion-psicologica.dto';

@Injectable()
export class ValoracionPsicologicaService {
  create(createValoracionPsicologicaDto: CreateValoracionPsicologicaDto) {
    return 'This action adds a new valoracionPsicologica';
  }

  findAll() {
    return `This action returns all valoracionPsicologica`;
  }

  findOne(id: number) {
    return `This action returns a #${id} valoracionPsicologica`;
  }

  update(id: number, updateValoracionPsicologicaDto: UpdateValoracionPsicologicaDto) {
    return `This action updates a #${id} valoracionPsicologica`;
  }

  remove(id: number) {
    return `This action removes a #${id} valoracionPsicologica`;
  }
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateValoracionPsicologicaDto } from './create-valoracion-psicologica.dto';

export class UpdateValoracionPsicologicaDto extends PartialType(CreateValoracionPsicologicaDto) {}

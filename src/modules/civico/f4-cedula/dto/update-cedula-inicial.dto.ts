import { PartialType } from '@nestjs/mapped-types';
import { CreateCedulaInicialDto } from './create-cedula-inicial.dto';

export class UpdateCedulaInicialDto extends PartialType(CreateCedulaInicialDto) {}
import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudioSocioeconomicoDto } from './create-estudio-socioeconomico.dto';

export class UpdateEstudioSocioeconomicoDto extends PartialType(CreateEstudioSocioeconomicoDto) {}
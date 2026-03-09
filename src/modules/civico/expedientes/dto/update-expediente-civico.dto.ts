import { PartialType } from '@nestjs/mapped-types';
import { CreateExpedienteCivicoDto } from './create-expediente-civico.dto';

// Todos los campos quedan opcionales para PATCH
export class UpdateExpedienteCivicoDto extends PartialType(CreateExpedienteCivicoDto) {}
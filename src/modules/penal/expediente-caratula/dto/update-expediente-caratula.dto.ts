import { PartialType } from '@nestjs/mapped-types';
import { CreateExpedienteCaratulaDto } from './create-expediente-caratula.dto';

export class UpdateExpedienteCaratulaDto extends PartialType(
  CreateExpedienteCaratulaDto,
) {}

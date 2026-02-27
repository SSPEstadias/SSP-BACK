import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficiarioDto } from './create-beneficiario.dto';

// PartialType hace todos los campos opcionales para el UPDATE
export class UpdateBeneficiarioDto extends PartialType(CreateBeneficiarioDto) {}
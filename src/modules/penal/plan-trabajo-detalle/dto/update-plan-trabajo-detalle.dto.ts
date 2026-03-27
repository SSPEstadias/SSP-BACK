import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanTrabajoDetalleDto } from './create-plan-trabajo-detalle.dto';

export class UpdatePlanTrabajoDetalleDto extends PartialType(
  CreatePlanTrabajoDetalleDto,
) {}

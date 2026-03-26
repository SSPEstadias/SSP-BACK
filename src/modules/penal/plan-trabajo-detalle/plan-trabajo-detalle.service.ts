import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EstatusPlanTrabajoDetalle,
  PlanTrabajoDetalle,
} from './entities/plan-trabajo-detalle.entity';
import { CreatePlanTrabajoDetalleDto } from './dto/create-plan-trabajo-detalle.dto';
import { UpdatePlanTrabajoDetalleDto } from './dto/update-plan-trabajo-detalle.dto';
import { PlanTrabajo } from '../plan-trabajo/entities/plan-trabajo.entity';
import { Actividad } from '../../../shared/actividades/actividad.entity';

@Injectable()
export class PlanTrabajoDetalleService {
  constructor(
    @InjectRepository(PlanTrabajoDetalle)
    private readonly detalleRepo: Repository<PlanTrabajoDetalle>,
    @InjectRepository(PlanTrabajo)
    private readonly planRepo: Repository<PlanTrabajo>,
    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,
  ) {}

  async create(dto: CreatePlanTrabajoDetalleDto): Promise<PlanTrabajoDetalle> {
    const planTrabajo = await this.planRepo.findOne({
      where: { id: dto.planTrabajoId },
    });

    if (!planTrabajo) {
      throw new NotFoundException('Plan de trabajo no encontrado');
    }

    const actividad = await this.actividadRepo.findOne({
      where: { id: dto.actividadId },
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    const detalleExistente = await this.detalleRepo.findOne({
      where: {
        planTrabajo: { id: dto.planTrabajoId },
        actividad: { id: dto.actividadId },
      },
      relations: ['planTrabajo', 'actividad'],
    });

    if (detalleExistente) {
      throw new ConflictException(
        'Esta actividad ya fue agregada a este plan de trabajo',
      );
    }

    const detalle = this.detalleRepo.create({
      planTrabajo,
      actividad,
      estatus: dto.estatus ?? EstatusPlanTrabajoDetalle.PENDIENTE,
      objetivo: dto.objetivo,
      cumplimiento: dto.cumplimiento,
      observaciones: dto.observaciones,
      fechaAsignacion: dto.fechaAsignacion,
      fechaCumplimiento: dto.fechaCumplimiento,
    });

    return this.detalleRepo.save(detalle);
  }

  findAll(): Promise<PlanTrabajoDetalle[]> {
    return this.detalleRepo.find({
      relations: ['planTrabajo', 'actividad'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PlanTrabajoDetalle> {
    const detalle = await this.detalleRepo.findOne({
      where: { id },
      relations: ['planTrabajo', 'actividad'],
    });

    if (!detalle) {
      throw new NotFoundException('Detalle de plan de trabajo no encontrado');
    }

    return detalle;
  }

  async findByPlan(planTrabajoId: number): Promise<PlanTrabajoDetalle[]> {
    const detalles = await this.detalleRepo.find({
      where: { planTrabajo: { id: planTrabajoId } },
      relations: ['planTrabajo', 'actividad'],
      order: { id: 'DESC' },
    });

    if (!detalles.length) {
      throw new NotFoundException(
        'No existen detalles para este plan de trabajo',
      );
    }

    return detalles;
  }

  async update(
    id: number,
    dto: UpdatePlanTrabajoDetalleDto,
  ): Promise<PlanTrabajoDetalle> {
    const detalle = await this.findOne(id);

    if (dto.estatus !== undefined) detalle.estatus = dto.estatus;
    if (dto.objetivo !== undefined) detalle.objetivo = dto.objetivo;
    if (dto.cumplimiento !== undefined) detalle.cumplimiento = dto.cumplimiento;
    if (dto.observaciones !== undefined)
      detalle.observaciones = dto.observaciones;
    if (dto.fechaAsignacion !== undefined)
      detalle.fechaAsignacion = dto.fechaAsignacion;
    if (dto.fechaCumplimiento !== undefined)
      detalle.fechaCumplimiento = dto.fechaCumplimiento;

    return this.detalleRepo.save(detalle);
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.findOne(id);
    await this.detalleRepo.remove(detalle);
  }
}

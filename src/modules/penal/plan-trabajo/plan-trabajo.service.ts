import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanTrabajo } from './entities/plan-trabajo.entity';
import { CreatePlanTrabajoDto } from './dto/create-plan-trabajo.dto';
import { UpdatePlanTrabajoDto } from './dto/update-plan-trabajo.dto';
import { PenalExpediente } from '../entities/penal.entity';
import { User, RolUsuario } from '../../../shared/users/entities/user.entity';

@Injectable()
export class PlanTrabajoService {
  constructor(
    @InjectRepository(PlanTrabajo)
    private readonly planRepo: Repository<PlanTrabajo>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreatePlanTrabajoDto): Promise<PlanTrabajo> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const guia = await this.userRepo.findOne({
      where: { id: dto.guiaId },
    });

    if (!guia) {
      throw new NotFoundException('Guía no encontrado');
    }

    if (guia.rol !== RolUsuario.GUIA) {
      throw new ConflictException(
        'El usuario seleccionado no tiene rol de guía',
      );
    }

    const plan = this.planRepo.create({
      expediente,
      guia,
      periodo: dto.periodo,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      datosJsonb: dto.datosJsonb,
    });

    return this.planRepo.save(plan);
  }

  findAll(): Promise<PlanTrabajo[]> {
    return this.planRepo.find({
      relations: ['expediente', 'guia'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PlanTrabajo> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['expediente', 'guia'],
    });

    if (!plan) {
      throw new NotFoundException('Plan de trabajo no encontrado');
    }

    return plan;
  }

  async findByExpediente(expedienteId: number): Promise<PlanTrabajo[]> {
    const planes = await this.planRepo.find({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'guia'],
      order: { id: 'DESC' },
    });

    if (!planes.length) {
      throw new NotFoundException(
        'No existen planes de trabajo para este expediente',
      );
    }

    return planes;
  }

  async update(id: number, dto: UpdatePlanTrabajoDto): Promise<PlanTrabajo> {
    const plan = await this.findOne(id);

    if (dto.periodo !== undefined) plan.periodo = dto.periodo;
    if (dto.fechaInicio !== undefined) plan.fechaInicio = dto.fechaInicio;
    if (dto.fechaFin !== undefined) plan.fechaFin = dto.fechaFin;
    if (dto.datosJsonb !== undefined) plan.datosJsonb = dto.datosJsonb;

    return this.planRepo.save(plan);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepo.remove(plan);
  }
}

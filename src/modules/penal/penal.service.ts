import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PenalExpediente,
  PenalEstatusExpediente,
} from './entities/penal.entity';
import { CreatePenalDto } from './dto/create-penal.dto';
import { UpdatePenalDto } from './dto/update-penal.dto';
import { Beneficiario } from '../../shared/beneficiarios/beneficiario.entity';

@Injectable()
export class PenalService {
  constructor(
    @InjectRepository(PenalExpediente)
    private readonly penalRepo: Repository<PenalExpediente>,
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepo: Repository<Beneficiario>,
  ) {}

  async create(dto: CreatePenalDto): Promise<PenalExpediente> {
    const beneficiario = await this.beneficiarioRepo.findOne({
      where: { id: dto.beneficiarioId },
    });

    if (!beneficiario) {
      throw new NotFoundException('Beneficiario no encontrado');
    }

    const expedienteExistente = await this.penalRepo.findOne({
      where: { beneficiario: { id: dto.beneficiarioId } },
      relations: ['beneficiario'],
    });

    if (expedienteExistente) {
      throw new ConflictException(
        'El beneficiario ya cuenta con expediente penal',
      );
    }

    const expediente = this.penalRepo.create({
      beneficiario,
      cPenal: dto.cPenal,
      expedienteTecnico: dto.expedienteTecnico,
      folioExpediente: dto.folioExpediente,
      juzgado: dto.juzgado,
      delito: dto.delito,
      agraviado: dto.agraviado,
      fechaIngresoPrograma: dto.fechaIngresoPrograma,
      fechaSuspensionProceso: dto.fechaSuspensionProceso,
      fechaFinSupervision: dto.fechaFinSupervision,
      medidaCautelar: dto.medidaCautelar,
      observaciones: dto.observaciones,
      estatus: PenalEstatusExpediente.REGISTRADO,
    });

    return this.penalRepo.save(expediente);
  }

  findAll(): Promise<PenalExpediente[]> {
    return this.penalRepo.find({
      relations: ['beneficiario'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PenalExpediente> {
    const expediente = await this.penalRepo.findOne({
      where: { id },
      relations: ['beneficiario'],
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    return expediente;
  }

  async update(id: number, dto: UpdatePenalDto): Promise<PenalExpediente> {
    const expediente = await this.findOne(id);

    if (dto.cPenal !== undefined) expediente.cPenal = dto.cPenal;
    if (dto.expedienteTecnico !== undefined)
      expediente.expedienteTecnico = dto.expedienteTecnico;
    if (dto.folioExpediente !== undefined)
      expediente.folioExpediente = dto.folioExpediente;
    if (dto.juzgado !== undefined) expediente.juzgado = dto.juzgado;
    if (dto.delito !== undefined) expediente.delito = dto.delito;
    if (dto.agraviado !== undefined) expediente.agraviado = dto.agraviado;
    if (dto.fechaIngresoPrograma !== undefined)
      expediente.fechaIngresoPrograma = dto.fechaIngresoPrograma;
    if (dto.fechaSuspensionProceso !== undefined)
      expediente.fechaSuspensionProceso = dto.fechaSuspensionProceso;
    if (dto.fechaFinSupervision !== undefined)
      expediente.fechaFinSupervision = dto.fechaFinSupervision;
    if (dto.medidaCautelar !== undefined)
      expediente.medidaCautelar = dto.medidaCautelar;
    if (dto.observaciones !== undefined)
      expediente.observaciones = dto.observaciones;
    if (dto.estatus !== undefined) expediente.estatus = dto.estatus;

    return this.penalRepo.save(expediente);
  }

  async remove(id: number): Promise<void> {
    const expediente = await this.findOne(id);
    await this.penalRepo.remove(expediente);
  }
  async getResumenExpediente(id: number) {
    const expediente = await this.penalRepo.findOne({
      where: { id },
      relations: ['beneficiario'],
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const { ValoracionPsicologica } =
      await import('./valoracion-psicologica/entities/valoracion-psicologica.entity');
    const { EstudioTrabajoSocial } =
      await import('./estudio-trabajo-social/entities/estudio-trabajo-social.entity');
    const { PlanTrabajo } =
      await import('./plan-trabajo/entities/plan-trabajo.entity');
    const { PlanTrabajoDetalle } =
      await import('./plan-trabajo-detalle/entities/plan-trabajo-detalle.entity');
    const { ExpedienteCaratula } =
      await import('./expediente-caratula/entities/expediente-caratula.entity');

    const valoracionRepo = this.penalRepo.manager.getRepository(
      ValoracionPsicologica,
    );
    const estudioRepo =
      this.penalRepo.manager.getRepository(EstudioTrabajoSocial);
    const planRepo = this.penalRepo.manager.getRepository(PlanTrabajo);
    const detalleRepo =
      this.penalRepo.manager.getRepository(PlanTrabajoDetalle);
    const caratulaRepo =
      this.penalRepo.manager.getRepository(ExpedienteCaratula);

    const f1 = await valoracionRepo.findOne({
      where: { expediente: { id } },
      relations: ['expediente', 'psicologo'],
    });

    const f2 = await estudioRepo.findOne({
      where: { expediente: { id } },
      relations: ['expediente', 'trabajadorSocial'],
    });

    const planes = await planRepo.find({
      where: { expediente: { id } },
      relations: ['expediente', 'guia'],
      order: { id: 'DESC' },
    });

    const planIds = planes.map((p) => p.id);

    const detalles = planIds.length
      ? await detalleRepo
          .createQueryBuilder('detalle')
          .leftJoinAndSelect('detalle.planTrabajo', 'planTrabajo')
          .leftJoinAndSelect('detalle.actividad', 'actividad')
          .where('planTrabajo.id IN (:...planIds)', { planIds })
          .orderBy('detalle.id', 'DESC')
          .getMany()
      : [];

    const caratula = await caratulaRepo.findOne({
      where: { expediente: { id } },
      relations: ['expediente'],
    });

    const resumenPlanes = planes.map((plan) => ({
      ...plan,
      detalles: detalles.filter((d) => d.planTrabajo.id === plan.id),
    }));

    const tieneF1 = !!f1;
    const tieneF2 = !!f2;
    const tieneF3 = planes.length > 0;
    const tieneDetalleF3 = detalles.length > 0;
    const tieneCaratula = !!caratula;

    return {
      expediente,
      beneficiario: expediente.beneficiario,
      f1,
      f2,
      planes: resumenPlanes,
      caratula,
      validaciones: {
        tieneF1,
        tieneF2,
        tieneF3,
        tieneDetalleF3,
        tieneCaratula,
        caratulaHabilitada: tieneF1 && tieneF2 && tieneF3 && tieneDetalleF3,
      },
    };
  }
}

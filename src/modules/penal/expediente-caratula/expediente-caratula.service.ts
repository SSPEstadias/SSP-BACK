import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpedienteCaratula } from './entities/expediente-caratula.entity';
import { CreateExpedienteCaratulaDto } from './dto/create-expediente-caratula.dto';
import { UpdateExpedienteCaratulaDto } from './dto/update-expediente-caratula.dto';
import {
  PenalExpediente,
  PenalEstatusExpediente,
} from '../entities/penal.entity';
import { ValoracionPsicologica } from '../valoracion-psicologica/entities/valoracion-psicologica.entity';
import { EstudioTrabajoSocial } from '../estudio-trabajo-social/entities/estudio-trabajo-social.entity';
import { PlanTrabajo } from '../plan-trabajo/entities/plan-trabajo.entity';
import { PlanTrabajoDetalle } from '../plan-trabajo-detalle/entities/plan-trabajo-detalle.entity';

@Injectable()
export class ExpedienteCaratulaService {
  constructor(
    @InjectRepository(ExpedienteCaratula)
    private readonly caratulaRepo: Repository<ExpedienteCaratula>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(ValoracionPsicologica)
    private readonly f1Repo: Repository<ValoracionPsicologica>,
    @InjectRepository(EstudioTrabajoSocial)
    private readonly f2Repo: Repository<EstudioTrabajoSocial>,
    @InjectRepository(PlanTrabajo)
    private readonly planRepo: Repository<PlanTrabajo>,
    @InjectRepository(PlanTrabajoDetalle)
    private readonly detalleRepo: Repository<PlanTrabajoDetalle>,
  ) {}

  async create(dto: CreateExpedienteCaratulaDto): Promise<ExpedienteCaratula> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
      relations: ['beneficiario'],
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const existente = await this.caratulaRepo.findOne({
      where: { expediente: { id: dto.expedienteId } },
      relations: ['expediente'],
    });

    if (existente) {
      throw new ConflictException('Este expediente ya cuenta con carátula');
    }

    const f1 = await this.f1Repo.findOne({
      where: { expediente: { id: dto.expedienteId } },
      relations: ['expediente'],
    });

    if (!f1) {
      throw new ConflictException(
        'No se puede generar la carátula: falta F1 valoración psicológica',
      );
    }

    const f2 = await this.f2Repo.findOne({
      where: { expediente: { id: dto.expedienteId } },
      relations: ['expediente'],
    });

    if (!f2) {
      throw new ConflictException(
        'No se puede generar la carátula: falta F2 estudio de trabajo social',
      );
    }

    const planes = await this.planRepo.find({
      where: { expediente: { id: dto.expedienteId } },
      relations: ['expediente'],
    });

    if (!planes.length) {
      throw new ConflictException(
        'No se puede generar la carátula: falta F3 plan de trabajo',
      );
    }

    const planIds = planes.map((p) => p.id);
    const detalles = await this.detalleRepo
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.planTrabajo', 'planTrabajo')
      .where('planTrabajo.id IN (:...planIds)', { planIds })
      .getMany();

    if (!detalles.length) {
      throw new ConflictException(
        'No se puede generar la carátula: el F3 no tiene actividades registradas',
      );
    }

    const caratula = this.caratulaRepo.create({
      expediente,
      nombre: dto.nombre ?? expediente.beneficiario?.nombre,
      alias: dto.alias,
      juzgado: dto.juzgado ?? expediente.juzgado,
      delito: dto.delito ?? expediente.delito,
      agraviado: dto.agraviado ?? expediente.agraviado,
      fechaIngresoPrograma:
        dto.fechaIngresoPrograma ?? expediente.fechaIngresoPrograma,
      fechaSuspensionProceso:
        dto.fechaSuspensionProceso ?? expediente.fechaSuspensionProceso,
      fechaFinSupervision:
        dto.fechaFinSupervision ?? expediente.fechaFinSupervision,
      medidaCautelar: dto.medidaCautelar ?? expediente.medidaCautelar,
      observaciones: dto.observaciones,
    });

    const saved = await this.caratulaRepo.save(caratula);

    expediente.estatus = PenalEstatusExpediente.CARATULA_HABILITADA;
    await this.expedienteRepo.save(expediente);

    return saved;
  }

  findAll(): Promise<ExpedienteCaratula[]> {
    return this.caratulaRepo.find({
      relations: ['expediente'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ExpedienteCaratula> {
    const caratula = await this.caratulaRepo.findOne({
      where: { id },
      relations: ['expediente'],
    });

    if (!caratula) {
      throw new NotFoundException('Carátula no encontrada');
    }

    return caratula;
  }

  async findByExpediente(expedienteId: number): Promise<ExpedienteCaratula> {
    const caratula = await this.caratulaRepo.findOne({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente'],
    });

    if (!caratula) {
      throw new NotFoundException('No existe carátula para este expediente');
    }

    return caratula;
  }

  async update(
    id: number,
    dto: UpdateExpedienteCaratulaDto,
  ): Promise<ExpedienteCaratula> {
    const caratula = await this.findOne(id);

    if (dto.nombre !== undefined) caratula.nombre = dto.nombre;
    if (dto.alias !== undefined) caratula.alias = dto.alias;
    if (dto.juzgado !== undefined) caratula.juzgado = dto.juzgado;
    if (dto.delito !== undefined) caratula.delito = dto.delito;
    if (dto.agraviado !== undefined) caratula.agraviado = dto.agraviado;
    if (dto.fechaIngresoPrograma !== undefined)
      caratula.fechaIngresoPrograma = dto.fechaIngresoPrograma;
    if (dto.fechaSuspensionProceso !== undefined)
      caratula.fechaSuspensionProceso = dto.fechaSuspensionProceso;
    if (dto.fechaFinSupervision !== undefined)
      caratula.fechaFinSupervision = dto.fechaFinSupervision;
    if (dto.medidaCautelar !== undefined)
      caratula.medidaCautelar = dto.medidaCautelar;
    if (dto.observaciones !== undefined)
      caratula.observaciones = dto.observaciones;

    return this.caratulaRepo.save(caratula);
  }

  async remove(id: number): Promise<void> {
    const caratula = await this.findOne(id);
    await this.caratulaRepo.remove(caratula);
  }
}

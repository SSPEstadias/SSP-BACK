import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EstatusSupervision,
  HistorialSupervision,
} from './entities/historial-supervision.entity';
import { CreateHistorialSupervisionDto } from './dto/create-historial-supervision.dto';
import { UpdateHistorialSupervisionDto } from './dto/update-historial-supervision.dto';
import { PenalExpediente } from '../entities/penal.entity';

@Injectable()
export class HistorialSupervisionService {
  constructor(
    @InjectRepository(HistorialSupervision)
    private readonly historialRepo: Repository<HistorialSupervision>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
  ) {}

  async create(
    dto: CreateHistorialSupervisionDto,
  ): Promise<HistorialSupervision> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const existente = await this.historialRepo.findOne({
      where: {
        expediente: { id: dto.expedienteId },
        mes: dto.mes,
      },
      relations: ['expediente'],
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe un registro de supervisión para este mes',
      );
    }

    const historial = this.historialRepo.create({
      expediente,
      mes: dto.mes,
      periodo: dto.periodo,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      estatus: dto.estatus ?? EstatusSupervision.PARCIAL,
      observaciones: dto.observaciones,
    });

    return this.historialRepo.save(historial);
  }

  findAll(): Promise<HistorialSupervision[]> {
    return this.historialRepo.find({
      relations: ['expediente'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<HistorialSupervision> {
    const historial = await this.historialRepo.findOne({
      where: { id },
      relations: ['expediente'],
    });

    if (!historial) {
      throw new NotFoundException('Registro de supervisión no encontrado');
    }

    return historial;
  }

  async findByExpediente(
    expedienteId: number,
  ): Promise<HistorialSupervision[]> {
    const historial = await this.historialRepo.find({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente'],
      order: { mes: 'ASC' },
    });

    if (!historial.length) {
      throw new NotFoundException(
        'No existe historial de supervisión para este expediente',
      );
    }

    return historial;
  }

  async update(
    id: number,
    dto: UpdateHistorialSupervisionDto,
  ): Promise<HistorialSupervision> {
    const historial = await this.findOne(id);

    if (dto.mes !== undefined) historial.mes = dto.mes;
    if (dto.periodo !== undefined) historial.periodo = dto.periodo;
    if (dto.fechaInicio !== undefined) historial.fechaInicio = dto.fechaInicio;
    if (dto.fechaFin !== undefined) historial.fechaFin = dto.fechaFin;
    if (dto.estatus !== undefined) historial.estatus = dto.estatus;
    if (dto.observaciones !== undefined)
      historial.observaciones = dto.observaciones;

    return this.historialRepo.save(historial);
  }

  async remove(id: number): Promise<void> {
    const historial = await this.findOne(id);
    await this.historialRepo.remove(historial);
  }
}

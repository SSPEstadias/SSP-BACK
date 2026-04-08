import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidencia } from './incidencia.entity';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { IncidenciaEstatusEnum, CivicStatusEnum } from '../enums/civico.enums';

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(Incidencia)
    private readonly incidenciaRepo: Repository<Incidencia>,

    @InjectRepository(ExpedienteCivico)
    private readonly expedienteRepo: Repository<ExpedienteCivico>,
  ) {}

  async create(dto: CreateIncidenciaDto): Promise<Incidencia> {
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });

    if (!expediente) {
      throw new BadRequestException(`Expediente no encontrado`);
    }

    const incidencia = this.incidenciaRepo.create(dto);
    const saved = await this.incidenciaRepo.save(incidencia);

    // Si la incidencia es acumulativa, verificar si se alcanza el límite de 3 strikes
    if (dto.esAcumulativa) {
      const strikesCount = await this.incidenciaRepo.count({
        where: {
          expedienteId: dto.expedienteId,
          esAcumulativa: true,
          estatusResolucion: IncidenciaEstatusEnum.PENDIENTE,
        },
      });

      if (strikesCount >= 3) {
        expediente.estatusProceso = CivicStatusEnum.BAJA_POR_ACUMULACION_DE_INCIDENCIAS;
        await this.expedienteRepo.save(expediente);
      }
    }

    return saved;
  }

  async findByExpediente(expedienteId: string): Promise<Incidencia[]> {
    return this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'DESC' },
    });
  }

  async findOne(idUUID: string): Promise<Incidencia> {
    const incidencia = await this.incidenciaRepo.findOne({
      where: { idUUID },
    });

    if (!incidencia) {
      throw new NotFoundException(`Incidencia no encontrada`);
    }

    return incidencia;
  }

  // Devuelve el total de strikes activos (incidencias acumulativas pendientes).
  async contarStrikes(expedienteId: string): Promise<{ total: number }> {
    const total = await this.incidenciaRepo.count({
      where: {
        expedienteId,
        esAcumulativa: true,
        estatusResolucion: IncidenciaEstatusEnum.PENDIENTE,
      },
    });

    return { total };
  }

  async resolver(idUUID: string, numOficio?: string): Promise<Incidencia> {
    const incidencia = await this.findOne(idUUID);

    incidencia.estatusResolucion = IncidenciaEstatusEnum.RESUELTA;
    if (numOficio) {
      incidencia.numOficioNotificacion = numOficio;
    }

    return this.incidenciaRepo.save(incidencia);
  }
}
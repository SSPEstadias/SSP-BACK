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
      folioIncorporacion: dto.folioIncorporacion,
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
    if (dto.folioIncorporacion !== undefined)
      expediente.folioIncorporacion = dto.folioIncorporacion;
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
}

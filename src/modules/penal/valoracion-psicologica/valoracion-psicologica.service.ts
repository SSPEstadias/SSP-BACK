import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValoracionPsicologica } from './entities/valoracion-psicologica.entity';
import { CreateValoracionPsicologicaDto } from './dto/create-valoracion-psicologica.dto';
import { UpdateValoracionPsicologicaDto } from './dto/update-valoracion-psicologica.dto';
import { PenalExpediente } from '../entities/penal.entity';
import { User } from '../../../shared/users/entities/user.entity';

@Injectable()
export class ValoracionPsicologicaService {
  constructor(
    @InjectRepository(ValoracionPsicologica)
    private readonly valoracionRepo: Repository<ValoracionPsicologica>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    dto: CreateValoracionPsicologicaDto,
  ): Promise<ValoracionPsicologica> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const psicologo = await this.userRepo.findOne({
      where: { id: dto.psicologoId },
    });

    if (!psicologo) {
      throw new NotFoundException('Psicólogo no encontrado');
    }

    const existe = await this.valoracionRepo.findOne({
      where: { expediente: { id: dto.expedienteId } },
      relations: ['expediente'],
    });

    if (existe) {
      throw new ConflictException(
        'Este expediente ya cuenta con valoración psicológica',
      );
    }

    const valoracion = this.valoracionRepo.create({
      expediente,
      psicologo,
      fechaEstudio: dto.fechaEstudio,
      motivoValoracion: dto.motivoValoracion,
      seccionesJsonb: dto.seccionesJsonb,
      observacionesGenerales: dto.observacionesGenerales,
      resultadosPruebas: dto.resultadosPruebas ?? {},
      accionDerivada: dto.accionDerivada ?? {},
    });

    return this.valoracionRepo.save(valoracion);
  }

  findAll(): Promise<ValoracionPsicologica[]> {
    return this.valoracionRepo.find({
      relations: ['expediente', 'psicologo'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ValoracionPsicologica> {
    const valoracion = await this.valoracionRepo.findOne({
      where: { id },
      relations: ['expediente', 'psicologo'],
    });

    if (!valoracion) {
      throw new NotFoundException('Valoración psicológica no encontrada');
    }

    return valoracion;
  }

  async findByExpediente(expedienteId: number): Promise<ValoracionPsicologica> {
    const valoracion = await this.valoracionRepo.findOne({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'psicologo'],
    });

    if (!valoracion) {
      throw new NotFoundException(
        'No existe valoración psicológica para este expediente',
      );
    }

    return valoracion;
  }

  async update(
    id: number,
    dto: UpdateValoracionPsicologicaDto,
  ): Promise<ValoracionPsicologica> {
    const valoracion = await this.findOne(id);

    if (dto.fechaEstudio !== undefined) valoracion.fechaEstudio = dto.fechaEstudio;
    if (dto.motivoValoracion !== undefined)
      valoracion.motivoValoracion = dto.motivoValoracion;
    if (dto.seccionesJsonb !== undefined)
      valoracion.seccionesJsonb = dto.seccionesJsonb;
    if (dto.observacionesGenerales !== undefined)
      valoracion.observacionesGenerales = dto.observacionesGenerales;
    if (dto.resultadosPruebas !== undefined)
      valoracion.resultadosPruebas = dto.resultadosPruebas;
    if (dto.accionDerivada !== undefined)
      valoracion.accionDerivada = dto.accionDerivada;

    return this.valoracionRepo.save(valoracion);
  }

  async remove(id: number): Promise<void> {
    const valoracion = await this.findOne(id);
    await this.valoracionRepo.remove(valoracion);
  }
}

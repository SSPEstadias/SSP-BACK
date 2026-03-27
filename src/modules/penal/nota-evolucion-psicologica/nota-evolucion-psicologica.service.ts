import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaEvolucionPsicologica } from './entities/nota-evolucion-psicologica.entity';
import { CreateNotaEvolucionPsicologicaDto } from './dto/create-nota-evolucion-psicologica.dto';
import { UpdateNotaEvolucionPsicologicaDto } from './dto/update-nota-evolucion-psicologica.dto';
import { PenalExpediente } from '../entities/penal.entity';
import { User, RolUsuario } from '../../../shared/users/entities/user.entity';

@Injectable()
export class NotaEvolucionPsicologicaService {
  constructor(
    @InjectRepository(NotaEvolucionPsicologica)
    private readonly notaRepo: Repository<NotaEvolucionPsicologica>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    dto: CreateNotaEvolucionPsicologicaDto,
  ): Promise<NotaEvolucionPsicologica> {
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

    if (psicologo.rol !== RolUsuario.PSICOLOGO) {
      throw new ConflictException(
        'El usuario seleccionado no tiene rol de psicólogo',
      );
    }

    const sesionExistente = await this.notaRepo.findOne({
      where: {
        expediente: { id: dto.expedienteId },
        numeroSesion: dto.numeroSesion,
      },
      relations: ['expediente'],
    });

    if (sesionExistente) {
      throw new ConflictException(
        'Ya existe una nota para ese número de sesión en este expediente',
      );
    }

    const nota = this.notaRepo.create({
      expediente,
      psicologo,
      fecha: dto.fecha,
      numeroSesion: dto.numeroSesion,
      objetivoSesion: dto.objetivoSesion,
      descripcionSesion: dto.descripcionSesion,
      tecnicasAplicadas: dto.tecnicasAplicadas,
      avances: dto.avances,
      observaciones: dto.observaciones,
      proximaSesion: dto.proximaSesion,
    });

    return this.notaRepo.save(nota);
  }

  findAll(): Promise<NotaEvolucionPsicologica[]> {
    return this.notaRepo.find({
      relations: ['expediente', 'psicologo'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<NotaEvolucionPsicologica> {
    const nota = await this.notaRepo.findOne({
      where: { id },
      relations: ['expediente', 'psicologo'],
    });

    if (!nota) {
      throw new NotFoundException(
        'Nota de evolución psicológica no encontrada',
      );
    }

    return nota;
  }

  async findByExpediente(
    expedienteId: number,
  ): Promise<NotaEvolucionPsicologica[]> {
    const notas = await this.notaRepo.find({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'psicologo'],
      order: { numeroSesion: 'ASC' },
    });

    if (!notas.length) {
      throw new NotFoundException(
        'No existen notas de evolución para este expediente',
      );
    }

    return notas;
  }

  async update(
    id: number,
    dto: UpdateNotaEvolucionPsicologicaDto,
  ): Promise<NotaEvolucionPsicologica> {
    const nota = await this.findOne(id);

    if (dto.fecha !== undefined) nota.fecha = dto.fecha;
    if (dto.numeroSesion !== undefined) nota.numeroSesion = dto.numeroSesion;
    if (dto.objetivoSesion !== undefined)
      nota.objetivoSesion = dto.objetivoSesion;
    if (dto.descripcionSesion !== undefined)
      nota.descripcionSesion = dto.descripcionSesion;
    if (dto.tecnicasAplicadas !== undefined)
      nota.tecnicasAplicadas = dto.tecnicasAplicadas;
    if (dto.avances !== undefined) nota.avances = dto.avances;
    if (dto.observaciones !== undefined) nota.observaciones = dto.observaciones;
    if (dto.proximaSesion !== undefined) nota.proximaSesion = dto.proximaSesion;

    return this.notaRepo.save(nota);
  }

  async remove(id: number): Promise<void> {
    const nota = await this.findOne(id);
    await this.notaRepo.remove(nota);
  }
}

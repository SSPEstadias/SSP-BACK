import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidenciaPenal } from './entities/incidencia-penal.entity';
import { CreateIncidenciaPenalDto } from './dto/create-incidencia-penal.dto';
import { UpdateIncidenciaPenalDto } from './dto/update-incidencia-penal.dto';
import { PenalExpediente } from '../entities/penal.entity';
import { User, RolUsuario } from '../../../shared/users/entities/user.entity';

@Injectable()
export class IncidenciasPenalService {
  constructor(
    @InjectRepository(IncidenciaPenal)
    private readonly incidenciaRepo: Repository<IncidenciaPenal>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateIncidenciaPenalDto): Promise<IncidenciaPenal> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
      relations: ['beneficiario'],
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const usuario = await this.userRepo.findOne({
      where: { id: dto.registradoPorId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario responsable no encontrado');
    }

    const rolesPermitidos = [
      RolUsuario.ADMIN,
      RolUsuario.GUIA,
      RolUsuario.PSICOLOGO,
      RolUsuario.TRABAJO_SOCIAL,
    ];

    if (!rolesPermitidos.includes(usuario.rol)) {
      throw new ConflictException(
        'El usuario no tiene permisos para registrar incidencias',
      );
    }

    const incidencia = this.incidenciaRepo.create({
      expediente,
      registradoPor: usuario,
      fecha: dto.fecha,
      tipo: dto.tipo,
      gravedad: dto.gravedad,
      descripcion: dto.descripcion,
      accionesTomadas: dto.accionesTomadas,
      observaciones: dto.observaciones,
      reincidencia: dto.reincidencia ?? false,
      estatus: dto.estatus,
    });

    return this.incidenciaRepo.save(incidencia);
  }

  findAll(): Promise<IncidenciaPenal[]> {
    return this.incidenciaRepo.find({
      relations: ['expediente', 'expediente.beneficiario', 'registradoPor'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<IncidenciaPenal> {
    const incidencia = await this.incidenciaRepo.findOne({
      where: { id },
      relations: ['expediente', 'expediente.beneficiario', 'registradoPor'],
    });

    if (!incidencia) {
      throw new NotFoundException('Incidencia penal no encontrada');
    }

    return incidencia;
  }

  async findByExpediente(expedienteId: number): Promise<IncidenciaPenal[]> {
    const incidencias = await this.incidenciaRepo.find({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'expediente.beneficiario', 'registradoPor'],
      order: { fecha: 'DESC', id: 'DESC' },
    });

    if (!incidencias.length) {
      throw new NotFoundException(
        'No existen incidencias para este expediente',
      );
    }

    return incidencias;
  }

  async update(
    id: number,
    dto: UpdateIncidenciaPenalDto,
  ): Promise<IncidenciaPenal> {
    const incidencia = await this.findOne(id);

    if (dto.fecha !== undefined) incidencia.fecha = dto.fecha;
    if (dto.tipo !== undefined) incidencia.tipo = dto.tipo;
    if (dto.gravedad !== undefined) incidencia.gravedad = dto.gravedad;
    if (dto.descripcion !== undefined) incidencia.descripcion = dto.descripcion;
    if (dto.accionesTomadas !== undefined) {
      incidencia.accionesTomadas = dto.accionesTomadas;
    }
    if (dto.observaciones !== undefined) {
      incidencia.observaciones = dto.observaciones;
    }
    if (dto.reincidencia !== undefined) {
      incidencia.reincidencia = dto.reincidencia;
    }
    if (dto.estatus !== undefined) incidencia.estatus = dto.estatus;

    return this.incidenciaRepo.save(incidencia);
  }

  async remove(id: number): Promise<void> {
    const incidencia = await this.findOne(id);
    await this.incidenciaRepo.remove(incidencia);
  }
}

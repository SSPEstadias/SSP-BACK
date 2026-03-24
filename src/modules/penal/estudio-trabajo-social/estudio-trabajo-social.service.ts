import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudioTrabajoSocial } from './entities/estudio-trabajo-social.entity';
import { CreateEstudioTrabajoSocialDto } from './dto/create-estudio-trabajo-social.dto';
import { UpdateEstudioTrabajoSocialDto } from './dto/update-estudio-trabajo-social.dto';
import { PenalExpediente } from '../entities/penal.entity';
import { User, RolUsuario } from '../../../shared/users/entities/user.entity';

@Injectable()
export class EstudioTrabajoSocialService {
  constructor(
    @InjectRepository(EstudioTrabajoSocial)
    private readonly estudioRepo: Repository<EstudioTrabajoSocial>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    dto: CreateEstudioTrabajoSocialDto,
  ): Promise<EstudioTrabajoSocial> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const trabajadorSocial = await this.userRepo.findOne({
      where: { id: dto.trabajadorSocialId },
    });

    if (!trabajadorSocial) {
      throw new NotFoundException('Trabajador social no encontrado');
    }

    if (trabajadorSocial.rol !== RolUsuario.TRABAJO_SOCIAL) {
      throw new ConflictException(
        'El usuario seleccionado no tiene rol de trabajo social',
      );
    }

    const existe = await this.estudioRepo.findOne({
      where: { expediente: { id: dto.expedienteId } },
      relations: ['expediente'],
    });

    if (existe) {
      throw new ConflictException(
        'Este expediente ya cuenta con estudio de trabajo social',
      );
    }

    const estudio = this.estudioRepo.create({
      expediente,
      trabajadorSocial,
      fechaEstudio: dto.fechaEstudio,
      seccionesJsonb: dto.seccionesJsonb,
      opinionPrograma: dto.opinionPrograma,
      diagnosticoSocial: dto.diagnosticoSocial,
    });

    return this.estudioRepo.save(estudio);
  }

  findAll(): Promise<EstudioTrabajoSocial[]> {
    return this.estudioRepo.find({
      relations: ['expediente', 'trabajadorSocial'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<EstudioTrabajoSocial> {
    const estudio = await this.estudioRepo.findOne({
      where: { id },
      relations: ['expediente', 'trabajadorSocial'],
    });

    if (!estudio) {
      throw new NotFoundException('Estudio de trabajo social no encontrado');
    }

    return estudio;
  }

  async findByExpediente(expedienteId: number): Promise<EstudioTrabajoSocial> {
    const estudio = await this.estudioRepo.findOne({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'trabajadorSocial'],
    });

    if (!estudio) {
      throw new NotFoundException(
        'No existe estudio de trabajo social para este expediente',
      );
    }

    return estudio;
  }

  async update(
    id: number,
    dto: UpdateEstudioTrabajoSocialDto,
  ): Promise<EstudioTrabajoSocial> {
    const estudio = await this.findOne(id);

    if (dto.fechaEstudio !== undefined) estudio.fechaEstudio = dto.fechaEstudio;
    if (dto.seccionesJsonb !== undefined)
      estudio.seccionesJsonb = dto.seccionesJsonb;
    if (dto.opinionPrograma !== undefined)
      estudio.opinionPrograma = dto.opinionPrograma;
    if (dto.diagnosticoSocial !== undefined)
      estudio.diagnosticoSocial = dto.diagnosticoSocial;

    return this.estudioRepo.save(estudio);
  }

  async remove(id: number): Promise<void> {
    const estudio = await this.findOne(id);
    await this.estudioRepo.remove(estudio);
  }
}

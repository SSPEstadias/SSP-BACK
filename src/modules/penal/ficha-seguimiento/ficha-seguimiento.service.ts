import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FichaSeguimiento } from './entities/ficha-seguimiento.entity';
import { CreateFichaSeguimientoDto } from './dto/create-ficha-seguimiento.dto';
import { UpdateFichaSeguimientoDto } from './dto/update-ficha-seguimiento.dto';
import { PenalExpediente } from '../entities/penal.entity';
import { User, RolUsuario } from '../../../shared/users/entities/user.entity';

@Injectable()
export class FichaSeguimientoService {
  constructor(
    @InjectRepository(FichaSeguimiento)
    private readonly fichaRepo: Repository<FichaSeguimiento>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private normalizarPeriodo(periodo: string): string {
    return periodo.trim();
  }

  async create(dto: CreateFichaSeguimientoDto): Promise<FichaSeguimiento> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: dto.expedienteId },
      relations: ['beneficiario'],
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

    const periodoNormalizado = this.normalizarPeriodo(dto.periodo);

    const fichaExistente = await this.fichaRepo.findOne({
      where: {
        expediente: { id: dto.expedienteId },
        periodo: periodoNormalizado,
      },
    });

    if (fichaExistente) {
      throw new ConflictException(
        `Ya existe una ficha de seguimiento para el expediente ${dto.expedienteId} en el periodo "${periodoNormalizado}"`,
      );
    }

    const ficha = this.fichaRepo.create({
      expediente,
      guia,
      fecha: dto.fecha,
      periodo: periodoNormalizado,
      datosPersonalesJsonb: dto.datosPersonalesJsonb,
      cumplimientoGeneral: dto.cumplimientoGeneral,
      comportamiento: dto.comportamiento,
      observaciones: dto.observaciones,
      incidenciasJsonb: dto.incidenciasJsonb ?? {},
      recomendaciones: dto.recomendaciones,
    });

    return this.fichaRepo.save(ficha);
  }

  findAll(): Promise<FichaSeguimiento[]> {
    return this.fichaRepo.find({
      relations: ['expediente', 'guia'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<FichaSeguimiento> {
    const ficha = await this.fichaRepo.findOne({
      where: { id },
      relations: ['expediente', 'guia'],
    });

    if (!ficha) {
      throw new NotFoundException('Ficha de seguimiento no encontrada');
    }

    return ficha;
  }

  async findByExpediente(expedienteId: number): Promise<FichaSeguimiento[]> {
    const fichas = await this.fichaRepo.find({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'guia'],
      order: { id: 'DESC' },
    });

    if (!fichas.length) {
      throw new NotFoundException(
        'No existen fichas de seguimiento para este expediente',
      );
    }

    return fichas;
  }

  async update(
    id: number,
    dto: UpdateFichaSeguimientoDto,
  ): Promise<FichaSeguimiento> {
    const ficha = await this.findOne(id);

    if (dto.guiaId !== undefined) {
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

      ficha.guia = guia;
    }

    if (
      dto.expedienteId !== undefined &&
      dto.expedienteId !== ficha.expediente.id
    ) {
      const expediente = await this.expedienteRepo.findOne({
        where: { id: dto.expedienteId },
        relations: ['beneficiario'],
      });

      if (!expediente) {
        throw new NotFoundException('Expediente penal no encontrado');
      }

      ficha.expediente = expediente;
    }

    const expedienteIdFinal = ficha.expediente.id;
    const periodoFinal =
      dto.periodo !== undefined
        ? this.normalizarPeriodo(dto.periodo)
        : ficha.periodo;

    if (
      dto.periodo !== undefined ||
      (dto.expedienteId !== undefined &&
        dto.expedienteId !== ficha.expediente.id)
    ) {
      const fichaDuplicada = await this.fichaRepo.findOne({
        where: {
          expediente: { id: expedienteIdFinal },
          periodo: periodoFinal,
        },
      });

      if (fichaDuplicada && fichaDuplicada.id !== ficha.id) {
        throw new ConflictException(
          `Ya existe otra ficha de seguimiento para el expediente ${expedienteIdFinal} en el periodo "${periodoFinal}"`,
        );
      }
    }

    if (dto.fecha !== undefined) ficha.fecha = dto.fecha;
    if (dto.periodo !== undefined) ficha.periodo = periodoFinal;
    if (dto.datosPersonalesJsonb !== undefined)
      ficha.datosPersonalesJsonb = dto.datosPersonalesJsonb;
    if (dto.cumplimientoGeneral !== undefined)
      ficha.cumplimientoGeneral = dto.cumplimientoGeneral;
    if (dto.comportamiento !== undefined)
      ficha.comportamiento = dto.comportamiento;
    if (dto.observaciones !== undefined)
      ficha.observaciones = dto.observaciones;
    if (dto.incidenciasJsonb !== undefined)
      ficha.incidenciasJsonb = dto.incidenciasJsonb;
    if (dto.recomendaciones !== undefined)
      ficha.recomendaciones = dto.recomendaciones;

    return this.fichaRepo.save(ficha);
  }

  async remove(id: number): Promise<void> {
    const ficha = await this.findOne(id);
    await this.fichaRepo.remove(ficha);
  }
}

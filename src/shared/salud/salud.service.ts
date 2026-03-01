import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salud } from './salud.entity';
import { CreateSaludDto } from './dto/create-salud.dto';
import { UpdateSaludDto } from './dto/update-salud.dto';

@Injectable()
export class SaludService {
  constructor(
    @InjectRepository(Salud)
    private readonly saludRepository: Repository<Salud>,
  ) {}

  // ── RF-005/RF-009: Crear perfil de salud para beneficiario ──────────
  async create(dto: CreateSaludDto): Promise<Salud> {
    // Verificar que no exista un perfil de salud para este beneficiario
    const existe = await this.saludRepository.findOne({
      where: { beneficiarioId: dto.beneficiarioId },
    });

    if (existe) {
      throw new ConflictException(
        `El beneficiario con ID ${dto.beneficiarioId} ya tiene un perfil de salud registrado`,
      );
    }

    const nuevoSalud = this.saludRepository.create(dto);
    return await this.saludRepository.save(nuevoSalud);
  }

  // ── Obtener todos los perfiles de salud ────────────────────────────
  async findAll(): Promise<Salud[]> {
    return await this.saludRepository.find({
      order: { fechaActualizacion: 'DESC' },
    });
  }

  // ── Obtener perfil de salud por ID ────────────────────────────────
  async findOne(id: number): Promise<Salud> {
    const salud = await this.saludRepository.findOne({
      where: { id },
    });

    if (!salud) {
      throw new NotFoundException(`Perfil de salud con ID ${id} no encontrado`);
    }

    return salud;
  }

  // ── Obtener perfil de salud por beneficiario ID ──────────────────
  async findByBeneficiarioId(beneficiarioId: number): Promise<Salud> {
    const salud = await this.saludRepository.findOne({
      where: { beneficiarioId },
    });

    if (!salud) {
      throw new NotFoundException(
        `Perfil de salud para beneficiario ${beneficiarioId} no encontrado`,
      );
    }

    return salud;
  }

  // ── Filtrar por aptitud física (usado por RF-005 y RF-009) ────────
  async findByAptitudFisica(esApto: boolean): Promise<Salud[]> {
    return await this.saludRepository.find({
      where: { esAptoFisico: esApto },
      order: { fechaActualizacion: 'DESC' },
    });
  }

  // ── Actualizar perfil de salud ───────────────────────────────────
  async update(id: number, dto: UpdateSaludDto): Promise<Salud> {
    const salud = await this.findOne(id);
    Object.assign(salud, dto);
    return await this.saludRepository.save(salud);
  }

  // ── Actualizar por beneficiario ID ───────────────────────────────
  async updateByBeneficiarioId(
    beneficiarioId: number,
    dto: UpdateSaludDto,
  ): Promise<Salud> {
    const salud = await this.findByBeneficiarioId(beneficiarioId);
    Object.assign(salud, dto);
    return await this.saludRepository.save(salud);
  }

  // ── Eliminar perfil de salud ─────────────────────────────────────
  async remove(id: number): Promise<void> {
    const salud = await this.findOne(id);
    await this.saludRepository.remove(salud);
  }
}

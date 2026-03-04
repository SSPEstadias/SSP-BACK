import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividade.entity';
import { CreateActividadDto } from './dto/create-actividade.dto';
import { UpdateActividadDto } from './dto/update-actividade.dto';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  // ─── CREAR ───────────────────────────────────────────────────
  async create(createActividadDto: CreateActividadDto): Promise<Actividad> {
    const actividad = this.actividadRepository.create(createActividadDto);
    return await this.actividadRepository.save(actividad);
  }

  // ─── LISTAR TODAS ────────────────────────────────────────────
  async findAll(): Promise<Actividad[]> {
    return await this.actividadRepository.find({
      order: { fecha: 'DESC' },
    });
  }

  // ─── BUSCAR UNA ──────────────────────────────────────────────
  async findOne(id: string): Promise<Actividad> {
    const actividad = await this.actividadRepository.findOne({ where: { id } });
    if (!actividad) {
      throw new NotFoundException(`Actividad con id ${id} no encontrada`);
    }
    return actividad;
  }

  // ─── ACTUALIZAR ──────────────────────────────────────────────
  async update(id: string, updateActividadDto: UpdateActividadDto): Promise<Actividad> {
    const actividad = await this.findOne(id);
    const updated = this.actividadRepository.merge(actividad, updateActividadDto);
    return await this.actividadRepository.save(updated);
  }

  // ─── ELIMINAR ────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const actividad = await this.findOne(id);
    await this.actividadRepository.remove(actividad);
    return { message: `Actividad con id ${id} eliminada correctamente` };
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './actividad.entity';
import { CreateActividadDto } from './dto/create-actividad.dto';

@Injectable()
export class ActividadesService {

  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async create(dto: CreateActividadDto): Promise<Actividad> {
    const nueva = this.actividadRepository.create(dto);
    return await this.actividadRepository.save(nueva);
  }

  async findAll(): Promise<Actividad[]> {
    return await this.actividadRepository.find({
      where: { activo: true }, // Solo devuelve actividades activas
    });
  }

  async findOne(id: number): Promise<Actividad> {
    const actividad = await this.actividadRepository.findOne({
      where: { id },
    });
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return actividad;
  }

  // Desactivar actividad (en lugar de eliminarla)
  async desactivar(id: number): Promise<Actividad> {
    const actividad = await this.findOne(id);
    actividad.activo = false;
    return await this.actividadRepository.save(actividad);
  }
}
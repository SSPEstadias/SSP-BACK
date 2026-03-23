import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
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
  
      // ── validación de unicidad ANTES de insertar ──────────────────────
      const existe = await this.actividadRepository.findOne({
        where: { nombre: dto.nombre },
      });
  
      if (existe) {
        throw new ConflictException(
          `Ya existe una actividad con el nombre "${dto.nombre}"`,
        );
        
      }
      // ─────────────────────────────────────────────────────────────────
  
      const nueva = this.actividadRepository.create(dto);
      return await this.actividadRepository.save(nueva);
    }
  
    // Obtener todas las activas
    async findAll(): Promise<Actividad[]> {
      return await this.actividadRepository.find({
        where: { activo: true },
        order: { nombre: 'ASC' }, // ordenadas alfabéticamente
      });
    }
  
    // obtener todas incluyendo inactivas (solo debe tener acceso el Administrador)
    async findAllConInactivas(): Promise<Actividad[]> {
      return await this.actividadRepository.find({
        order: { nombre: 'ASC' },
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
  
    // Buscar por categoría (solo activas)
    async findByCategoria(categoria: string): Promise<Actividad[]> {
      return await this.actividadRepository.find({
        where: { categoria: categoria as any, activo: true },
      });
    }
  
    // Actualizar actividad
    async update(id: number, dto: Partial<CreateActividadDto>): Promise<Actividad> {
      const actividad = await this.findOne(id);
  
      // si viene un nombre nuevo, validar que no exista otra actividad con ese nombre
      if (dto.nombre && dto.nombre !== actividad.nombre) {
        const existe = await this.actividadRepository.findOne({
          where: { nombre: dto.nombre },
        });
        if (existe) {
          throw new ConflictException(
            `Ya existe una actividad con el nombre "${dto.nombre}"`,
          );
        }
      }
  
      Object.assign(actividad, dto);
      return await this.actividadRepository.save(actividad);
    }
  
    // Desactivar (soft delete — nunca se borra del catálogo)
    async desactivar(id: number): Promise<{ message: string }> {
      const actividad = await this.findOne(id);
      actividad.activo = false;
      await this.actividadRepository.save(actividad);
      return { message: `Actividad "${actividad.nombre}" desactivada correctamente` };
    }
  
    // Reactivar
    async reactivar(id: number): Promise<{ message: string }> {
      const actividad = await this.actividadRepository.findOne({ where: { id } });
      if (!actividad) {
        throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
      }
      actividad.activo = true;
      await this.actividadRepository.save(actividad);
      return { message: `Actividad "${actividad.nombre}" reactivada correctamente` };
    }
  }
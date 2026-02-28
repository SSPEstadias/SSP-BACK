import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  // ─── CREAR ───────────────────────────────────────────────────
  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    const persona = this.personaRepository.create(createPersonaDto);
    return await this.personaRepository.save(persona);
    // TypeORM genera el UUID automáticamente con @PrimaryGeneratedColumn('uuid')
  }

  // ─── LISTAR TODOS ────────────────────────────────────────────
  async findAll(): Promise<Persona[]> {
    return await this.personaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // ─── BUSCAR UNO ──────────────────────────────────────────────
  async findOne(id: string): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException(`Persona con id ${id} no encontrada`);
    }
    return persona;
  }

  // ─── ACTUALIZAR ──────────────────────────────────────────────
  async update(id: string, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findOne(id);
    const updated = this.personaRepository.merge(persona, updatePersonaDto);
    return await this.personaRepository.save(updated);
  }

  // ─── ELIMINAR ────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const persona = await this.findOne(id);
    await this.personaRepository.remove(persona);
    return { message: `Persona con id ${id} eliminada correctamente` };
  }
}
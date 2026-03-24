import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { SeguimientoPsicologico } from './seguimiento-psicologico.entity';
  import { CreateSeguimientoPsicologicoDto } from './dto/create-seguimiento-psicologico.dto';
  
  @Injectable()
  export class F5SeguimientoService {
    constructor(
      @InjectRepository(SeguimientoPsicologico)
      private readonly f5Repo: Repository<SeguimientoPsicologico>,
    ) {}
  
    // ── Registrar nueva nota de evolución ─────────────────────────────
    async create(dto: CreateSeguimientoPsicologicoDto): Promise<SeguimientoPsicologico> {
      // Validar que no exista ya esa sesión para el mismo expediente
      const existe = await this.f5Repo.findOne({
        where: {
          expedienteId: dto.expedienteId,
          numSesion: dto.numSesion,
        },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe una nota para la sesión #${dto.numSesion} del expediente ${dto.expedienteId}`,
        );
      }
  
      const nota = this.f5Repo.create(dto);
      return this.f5Repo.save(nota);
    }
  
    // ── Listar todas las sesiones de un expediente (cronológico) ──────
    async findByExpediente(expedienteId: string): Promise<SeguimientoPsicologico[]> {
      return this.f5Repo.find({
        where: { expedienteId },
        order: { numSesion: 'ASC' },
      });
    }
  
    // ── Obtener nota por UUID propio ──────────────────────────────────
    async findOne(idUUID: string): Promise<SeguimientoPsicologico> {
      const nota = await this.f5Repo.findOne({ where: { idUUID } });
      if (!nota) {
        throw new NotFoundException(`Nota de sesión ${idUUID} no encontrada`);
      }
      return nota;
    }
  
    // ── Obtener sesión específica por número ──────────────────────────
    async findBySesion(
      expedienteId: string,
      numSesion: number,
    ): Promise<SeguimientoPsicologico> {
      const nota = await this.f5Repo.findOne({
        where: { expedienteId, numSesion },
      });
      if (!nota) {
        throw new NotFoundException(
          `Sesión #${numSesion} no encontrada para expediente ${expedienteId}`,
        );
      }
      return nota;
    }
  
    // ── Actualizar nota de sesión (PATCH) ─────────────────────────────
    async update(
      idUUID: string,
      dto: Partial<CreateSeguimientoPsicologicoDto>,
    ): Promise<SeguimientoPsicologico> {
      const nota = await this.findOne(idUUID);
      const actualizada = this.f5Repo.merge(nota, dto);
      return this.f5Repo.save(actualizada);
    }
  
    // ── Contar sesiones totales de un expediente ──────────────────────
    async contarSesiones(expedienteId: string): Promise<number> {
      return this.f5Repo.count({ where: { expedienteId } });
    }
  }
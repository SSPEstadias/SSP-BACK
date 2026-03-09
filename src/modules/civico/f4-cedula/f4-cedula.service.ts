import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CedulaInicial } from './cedula-inicial';
  import { CreateCedulaInicialDto } from './dto/create-cedula-inicial.dto';
  import { UpdateCedulaInicialDto } from './dto/update-cedula-inicial.dto';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  @Injectable()
  export class F4CedulaService {
    constructor(
      @InjectRepository(CedulaInicial)
      private readonly f4Repo: Repository<CedulaInicial>,
    ) {}
  
    // ── Crear F4 (1:1 → solo uno por expediente) ──────────────────────
    async create(dto: CreateCedulaInicialDto): Promise<CedulaInicial> {
      const existe = await this.f4Repo.findOne({
        where: { expedienteId: dto.expedienteId },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe un F4 para el expediente ${dto.expedienteId}`,
        );
      }
  
      const f4 = this.f4Repo.create(dto);
      return this.f4Repo.save(f4);
    }
  
    // ── Obtener F4 por expediente ─────────────────────────────────────
    async findByExpediente(expedienteId: string): Promise<CedulaInicial> {
      const f4 = await this.f4Repo.findOne({ where: { expedienteId } });
      if (!f4) {
        throw new NotFoundException(
          `F4 no encontrado para expediente ${expedienteId}`,
        );
      }
      return f4;
    }
  
    // ── Obtener F4 por UUID propio ────────────────────────────────────
    async findOne(idUUID: string): Promise<CedulaInicial> {
      const f4 = await this.f4Repo.findOne({ where: { idUUID } });
      if (!f4) {
        throw new NotFoundException(`F4 con ID ${idUUID} no encontrado`);
      }
      return f4;
    }
  
    // ── Actualizar F4 (PATCH) ─────────────────────────────────────────
    async update(idUUID: string, dto: UpdateCedulaInicialDto): Promise<CedulaInicial> {
      const f4 = await this.findOne(idUUID);
  
      if (f4.estatusF4 === FormStatusEnum.CERRADO) {
        throw new BadRequestException(
          'No se puede modificar un F4 con estatus CERRADO',
        );
      }
  
      const actualizado = this.f4Repo.merge(f4, dto);
      return this.f4Repo.save(actualizado);
    }
  
    // ── Cambiar estatus ───────────────────────────────────────────────
    async cambiarEstatus(
      idUUID: string,
      nuevoEstatus: FormStatusEnum,
    ): Promise<CedulaInicial> {
      const f4 = await this.findOne(idUUID);
  
      if (f4.estatusF4 === FormStatusEnum.CERRADO) {
        throw new BadRequestException(
          'El F4 ya está CERRADO y no puede modificarse',
        );
      }
  
      f4.estatusF4 = nuevoEstatus;
      return this.f4Repo.save(f4);
    }
  }
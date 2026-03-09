import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { EntrevistaClinica } from './entrevista-clinica.entity';
  import { CreateEntrevistaClinicaDto } from './dto/create-entrevista-clinica.dto';
  import { UpdateEntrevistaClinicaDto } from './dto/update-entrevista-clinica.dto';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  @Injectable()
  export class F1EntrevistaService {
    constructor(
      @InjectRepository(EntrevistaClinica)
      private readonly f1Repo: Repository<EntrevistaClinica>,
    ) {}
  
    // ── Crear F1 (1:1 → solo uno por expediente) ──────────────────────
    async create(dto: CreateEntrevistaClinicaDto): Promise<EntrevistaClinica> {
      const existe = await this.f1Repo.findOne({
        where: { expedienteId: dto.expedienteId },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe un F1 para el expediente ${dto.expedienteId}`,
        );
      }
  
      const f1 = this.f1Repo.create(dto);
      return this.f1Repo.save(f1);
    }
  
    // ── Obtener F1 por expediente ─────────────────────────────────────
    async findByExpediente(expedienteId: string): Promise<EntrevistaClinica> {
      const f1 = await this.f1Repo.findOne({ where: { expedienteId } });
      if (!f1) {
        throw new NotFoundException(
          `F1 no encontrado para expediente ${expedienteId}`,
        );
      }
      return f1;
    }
  
    // ── Obtener F1 por UUID propio ────────────────────────────────────
    async findOne(idUUID: string): Promise<EntrevistaClinica> {
      const f1 = await this.f1Repo.findOne({ where: { idUUID } });
      if (!f1) {
        throw new NotFoundException(`F1 con ID ${idUUID} no encontrado`);
      }
      return f1;
    }
  
    // ── Actualizar F1 (PATCH) ─────────────────────────────────────────
    async update(
      idUUID: string,
      dto: UpdateEntrevistaClinicaDto,
    ): Promise<EntrevistaClinica> {
      const f1 = await this.findOne(idUUID);
  
      // RF: no se puede editar un formulario CERRADO
      if (f1.estatusF1 === FormStatusEnum.CERRADO) {
        throw new BadRequestException(
          'No se puede modificar un F1 con estatus CERRADO',
        );
      }
  
      const actualizado = this.f1Repo.merge(f1, dto);
      return this.f1Repo.save(actualizado);
    }
  
    // ── Cambiar estatus (PENDIENTE → EN_PROCESO → COMPLETADO → CERRADO)
    async cambiarEstatus(
      idUUID: string,
      nuevoEstatus: FormStatusEnum,
    ): Promise<EntrevistaClinica> {
      const f1 = await this.findOne(idUUID);
  
      if (f1.estatusF1 === FormStatusEnum.CERRADO) {
        throw new BadRequestException('El F1 ya está CERRADO y no puede modificarse');
      }
  
      f1.estatusF1 = nuevoEstatus;
      return this.f1Repo.save(f1);
    }
  }
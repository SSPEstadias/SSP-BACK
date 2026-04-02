import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { EstudioSocioeconomico } from './estudio-socioeconomico.entity';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { CreateEstudioSocioeconomicoDto } from './dto/create-estudio-socioeconomico.dto';
  import { UpdateEstudioSocioeconomicoDto } from './dto/update-estudio-socioeconomico.dto';
  import { FormStatusEnum } from '../enums/civico.enums';
  
  @Injectable()
  export class F2EstudioService {
    constructor(
      @InjectRepository(EstudioSocioeconomico)
      private readonly f2Repo: Repository<EstudioSocioeconomico>,
      @InjectRepository(ExpedienteCivico)
      private readonly expedienteRepo: Repository<ExpedienteCivico>,
    ) {}
  
    // ── Crear F2 (1:1 → solo uno por expediente) ──────────────────────
    async create(dto: CreateEstudioSocioeconomicoDto): Promise<EstudioSocioeconomico> {
      const expediente = await this.expedienteRepo.findOne({
        where: { idUUID: dto.expedienteId },
      });
      if (!expediente) {
        throw new NotFoundException(
          `No existe un expediente con id ${dto.expedienteId}`,
        );
      }

      const existe = await this.f2Repo.findOne({
        where: { expedienteId: dto.expedienteId },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe un F2 para el expediente ${dto.expedienteId}`,
        );
      }
  
      const f2 = this.f2Repo.create(dto);
      return this.f2Repo.save(f2);
    }
  
    // ── Obtener F2 por expediente ─────────────────────────────────────
    async findByExpediente(expedienteId: string): Promise<EstudioSocioeconomico> {
      const f2 = await this.f2Repo.findOne({ where: { expedienteId } });
      if (!f2) {
        throw new NotFoundException(
          `F2 no encontrado para expediente ${expedienteId}`,
        );
      }
      return f2;
    }
  
    // ── Obtener F2 por UUID propio ────────────────────────────────────
    async findOne(idUUID: string): Promise<EstudioSocioeconomico> {
      const f2 = await this.f2Repo.findOne({ where: { idUUID } });
      if (!f2) {
        throw new NotFoundException(`F2 con ID ${idUUID} no encontrado`);
      }
      return f2;
    }
  
    // ── Actualizar F2 (PATCH) ─────────────────────────────────────────
    async update(
      idUUID: string,
      dto: UpdateEstudioSocioeconomicoDto,
    ): Promise<EstudioSocioeconomico> {
      const f2 = await this.findOne(idUUID);
  
      if (f2.estatusF2 === FormStatusEnum.CERRADO) {
        throw new BadRequestException(
          'No se puede modificar un F2 con estatus CERRADO',
        );
      }
  
      const actualizado = this.f2Repo.merge(f2, dto);
      return this.f2Repo.save(actualizado);
    }
  
    // ── Cambiar estatus ───────────────────────────────────────────────
    async cambiarEstatus(
      idUUID: string,
      nuevoEstatus: FormStatusEnum,
    ): Promise<EstudioSocioeconomico> {
      const f2 = await this.findOne(idUUID);
  
      if (f2.estatusF2 === FormStatusEnum.CERRADO) {
        throw new BadRequestException('El F2 ya está CERRADO y no puede modificarse');
      }
  
      f2.estatusF2 = nuevoEstatus;
      return this.f2Repo.save(f2);
    }
  
    // ── RF-008: Verificar si F1 Y F2 están COMPLETADOS ───────────────
    // Usado por F3 para validar el Candado antes de crear el Plan de Trabajo
    async verificarCandadoF3(expedienteId: string): Promise<boolean> {
      const f2 = await this.f2Repo.findOne({ where: { expedienteId } });
      return f2?.estatusF2 === FormStatusEnum.COMPLETADO;
    }
  }
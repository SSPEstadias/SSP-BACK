import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { PlanTrabajo } from './plan-trabajo.entity';
  import { CreatePlanTrabajoDto } from './dto/create-plan-trabajo.dto';
  import { UpdatePlanTrabajoDto } from './dto/update-plan-trabajo.dto';
  import { FormStatusEnum } from '../enums/civico.enums';
  import { F1EntrevistaService } from '../f1-entrevista/f1-entrevista.service';
  import { F2EstudioService } from '../f2-estudio/f2-estudio.service';
  
  @Injectable()
  export class F3PlanService {
    constructor(
      @InjectRepository(PlanTrabajo)
      private readonly f3Repo: Repository<PlanTrabajo>,
      // inyectamos F1 y F2 para verificar el candado RF-008
      private readonly f1Service: F1EntrevistaService,
      private readonly f2Service: F2EstudioService,
    ) {}
  
    // ── Crear F3 — solo si F1 y F2 están COMPLETADOS (RF-008) ─────────
    async create(dto: CreatePlanTrabajoDto): Promise<PlanTrabajo> {
      // Candado RF-008: verificar ambos formularios previos
      await this.verificarCandadoF3(dto.expedienteId);
  
      // 1:1 → solo un F3 por expediente
      const existe = await this.f3Repo.findOne({
        where: { expedienteId: dto.expedienteId },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe un F3 para el expediente ${dto.expedienteId}`,
        );
      }
  
      const f3 = this.f3Repo.create(dto);
      return this.f3Repo.save(f3);
    }
  
    // ── Obtener F3 por expediente ─────────────────────────────────────
    async findByExpediente(expedienteId: string): Promise<PlanTrabajo> {
      const f3 = await this.f3Repo.findOne({ where: { expedienteId } });
      if (!f3) {
        throw new NotFoundException(
          `F3 no encontrado para expediente ${expedienteId}`,
        );
      }
      return f3;
    }
  
    // ── Obtener F3 por UUID propio ────────────────────────────────────
    async findOne(idUUID: string): Promise<PlanTrabajo> {
      const f3 = await this.f3Repo.findOne({ where: { idUUID } });
      if (!f3) {
        throw new NotFoundException(`F3 con ID ${idUUID} no encontrado`);
      }
      return f3;
    }
  
    // ── Actualizar F3 (PATCH) ─────────────────────────────────────────
    async update(idUUID: string, dto: UpdatePlanTrabajoDto): Promise<PlanTrabajo> {
      const f3 = await this.findOne(idUUID);
  
      // No se puede editar un F3 CERRADO
      if (f3.estatusF3 === FormStatusEnum.CERRADO) {
        throw new BadRequestException(
          'No se puede modificar un F3 con estatus CERRADO',
        );
      }
  
      const actualizado = this.f3Repo.merge(f3, dto);
      return this.f3Repo.save(actualizado);
    }
  
    // ── Cambiar estatus ───────────────────────────────────────────────
    async cambiarEstatus(
      idUUID: string,
      nuevoEstatus: FormStatusEnum,
    ): Promise<PlanTrabajo> {
      const f3 = await this.findOne(idUUID);
  
      if (f3.estatusF3 === FormStatusEnum.CERRADO) {
        throw new BadRequestException('El F3 ya está CERRADO y no puede modificarse');
      }
  
      f3.estatusF3 = nuevoEstatus;
      return this.f3Repo.save(f3);
    }
  
    // ── RF-008: Candado — F1 y F2 deben estar COMPLETADOS ────────────
    private async verificarCandadoF3(expedienteId: string): Promise<void> {
      // Verificar F1
      let f1Completo = false;
      try {
        const f1 = await this.f1Service.findByExpediente(expedienteId);
        f1Completo = f1.estatusF1 === FormStatusEnum.COMPLETADO;
      } catch {
        f1Completo = false;
      }
  
      // Verificar F2
      const f2Completo = await this.f2Service.verificarCandadoF3(expedienteId);
  
      if (!f1Completo || !f2Completo) {
        throw new BadRequestException(
          'No se puede crear el F3: el F1 (Entrevista Clínica) y el F2 (Estudio Socioeconómico) deben estar en estatus COMPLETADO (RF-008)',
        );
      }
    }
  }
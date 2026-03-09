import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Incidencia } from './incidencia.entity';
  import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
  import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
  import { IncidenciaEstatusEnum } from '../enums/civico.enums';
  import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
  import { CivicStatusEnum } from '../enums/civico.enums';
  
  // Umbral de strikes para baja automática (RF-013)
  const UMBRAL_STRIKES = 3;
  
  @Injectable()
  export class IncidenciasService {
    constructor(
      @InjectRepository(Incidencia)
      private readonly incidenciaRepo: Repository<Incidencia>,
      @InjectRepository(ExpedienteCivico)
      private readonly expedienteRepo: Repository<ExpedienteCivico>,
    ) {}
  
    // ── Registrar nueva incidencia ────────────────────────────────────
    async create(dto: CreateIncidenciaDto): Promise<Incidencia> {
      const incidencia = this.incidenciaRepo.create(dto);
      const guardada = await this.incidenciaRepo.save(incidencia);
  
      // RF-013: evaluar automáticamente si hay 3 strikes acumulativos
      if (dto.esAcumulativa !== false) {
        await this.evaluarStrikesBaja(dto.expedienteId);
      }
  
      return guardada;
    }
  
    // ── Listar incidencias de un expediente ───────────────────────────
    async findByExpediente(expedienteId: string): Promise<Incidencia[]> {
      return this.incidenciaRepo.find({
        where: { expedienteId },
        order: { fechaIncidencia: 'DESC' },
      });
    }
  
    // ── Obtener incidencia por UUID ───────────────────────────────────
    async findOne(idUUID: string): Promise<Incidencia> {
      const incidencia = await this.incidenciaRepo.findOne({ where: { idUUID } });
      if (!incidencia) {
        throw new NotFoundException(`Incidencia ${idUUID} no encontrada`);
      }
      return incidencia;
    }
  
    // ── Actualizar incidencia (ej: resolver o agregar oficio) ─────────
    async update(idUUID: string, dto: UpdateIncidenciaDto): Promise<Incidencia> {
      const incidencia = await this.findOne(idUUID);
      const actualizada = this.incidenciaRepo.merge(incidencia, dto);
      return this.incidenciaRepo.save(actualizada);
    }
  
    // ── Resolver una incidencia ───────────────────────────────────────
    async resolver(
      idUUID: string,
      numOficio?: string,
    ): Promise<Incidencia> {
      const incidencia = await this.findOne(idUUID);
      incidencia.estatusResolucion = IncidenciaEstatusEnum.RESUELTA;
      if (numOficio) incidencia.numOficioNotificacion = numOficio;
      return this.incidenciaRepo.save(incidencia);
    }
  
    // ── Contar strikes activos (acumulativas + PENDIENTE) ─────────────
    async contarStrikes(expedienteId: string): Promise<number> {
      return this.incidenciaRepo.count({
        where: {
          expedienteId,
          esAcumulativa: true,
          estatusResolucion: IncidenciaEstatusEnum.PENDIENTE,
        },
      });
    }
  
    // ── RF-013: Al 3er strike → BAJA_POR_INCIDENCIA automática ───────
    private async evaluarStrikesBaja(expedienteId: string): Promise<void> {
      const strikes = await this.contarStrikes(expedienteId);
  
      if (strikes >= UMBRAL_STRIKES) {
        // Marcar el expediente como baja por incidencia
        await this.expedienteRepo.update(
          { idUUID: expedienteId },
          { estatusProceso: CivicStatusEnum.BAJA_POR_ACUMULACION_DE_INCIDENCIAS},
        );
  
        // Marcar las incidencias pendientes como DERIVO_EN_BAJA
        await this.incidenciaRepo
          .createQueryBuilder()
          .update(Incidencia)
          .set({ estatusResolucion: IncidenciaEstatusEnum.DERIVO_EN_BAJA })
          .where('expediente_id = :expedienteId', { expedienteId })
          .andWhere('estatus_resolucion = :estatus', {
            estatus: IncidenciaEstatusEnum.PENDIENTE,
          })
          .execute();
      }
    }
  }
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpedienteCivico } from './expediente-civico.entity';
import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';
import { CreateExpedienteCivicoDto } from './dto/create-expediente-civico.dto';
import { UpdateExpedienteCivicoDto } from './dto/update-expediente-civico.dto';
import { CaratulaDto } from './dto/caratula-response.dto';

@Injectable()
export class ExpedientesCivicoService {
  constructor(
    @InjectRepository(ExpedienteCivico)
    private readonly expedienteRepo: Repository<ExpedienteCivico>,

    // Necesario para el JOIN en carátulas
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepo: Repository<Beneficiario>,
  ) {}

  // ── Crear expediente ──────────────────────────────────────────────
  async create(dto: CreateExpedienteCivicoDto): Promise<ExpedienteCivico> {
    // Generar folio automático institucional si no cumple el formato
    if (!dto.folioExpediente || !dto.folioExpediente.startsWith('DGPDYPC-RCP-')) {
      dto.folioExpediente = await this.generarSiguienteFolio();
    }
    const expediente = this.expedienteRepo.create(dto);
    return this.expedienteRepo.save(expediente);
  }

  private async generarSiguienteFolio(): Promise<string> {
    const prefix = 'DGPDYPC-RCP-';
    const last = await this.expedienteRepo.createQueryBuilder('exp')
      .where('exp.folioExpediente LIKE :pattern', { pattern: `${prefix}%` })
      .orderBy('exp.folioExpediente', 'DESC')
      .getOne();

    let nextNum = 1;
    if (last) {
      const parts = last.folioExpediente.split('-');
      const lastNumStr = parts[parts.length - 1];
      const lastNum = parseInt(lastNumStr, 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  // ── Listar todos ──────────────────────────────────────────────────
  async findAll(): Promise<ExpedienteCivico[]> {
    return this.expedienteRepo.find({
      order: { folioExpediente: 'DESC' },
    });
  }

  // ── Obtener uno por UUID ──────────────────────────────────────────
  async findOne(idUUID: string): Promise<ExpedienteCivico> {
    const exp = await this.expedienteRepo.findOne({ where: { idUUID } });
    if (!exp) {
      throw new NotFoundException(`Expediente ${idUUID} no encontrado`);
    }
    return exp;
  }

  // ── Buscar por CURP ───────────────────────────────────────────────
  async findByCurp(curp: string): Promise<ExpedienteCivico> {
    const exp = await this.expedienteRepo.findOne({ where: { curp } });
    if (!exp) {
      throw new NotFoundException(`Expediente con CURP ${curp} no encontrado`);
    }
    return exp;
  }

  // ── Actualizar (PATCH) ────────────────────────────────────────────
  async update(
    idUUID: string,
    dto: UpdateExpedienteCivicoDto,
  ): Promise<ExpedienteCivico> {
    const exp = await this.findOne(idUUID);
    const actualizado = this.expedienteRepo.merge(exp, dto);
    return this.expedienteRepo.save(actualizado);
  }

  // ── Baja lógica ───────────────────────────────────────────────────
  async deactivate(idUUID: string): Promise<ExpedienteCivico> {
    const exp = await this.findOne(idUUID);
    exp.esActivo = false;
    return this.expedienteRepo.save(exp);
  }

  // ════════════════════════════════════════════════════════════════════
  // ── CARÁTULAS ── JOIN con beneficiarios (evita N×2 llamadas)
  // ════════════════════════════════════════════════════════════════════

  // ── Lista de carátulas (para la tabla principal de beneficiarios) ──
  // 1 sola query con JOIN — reemplaza hacer GET /expedientes + GET /beneficiarios
  // por cada fila de la lista
  async findAllCaratulas(): Promise<CaratulaDto[]> {
    const rows = await this.expedienteRepo
      .createQueryBuilder('exp')
      .innerJoin(
        Beneficiario,
        'ben',
        'ben.id = exp.beneficiarioId',
      )
      .select([
        // Campos del expediente
        'exp.idUUID              AS "expedienteId"',
        'exp.folioExpediente  AS "folioExpediente"',
        'exp.causaPenal          AS "causaPenal"',
        'exp.aliasSobrenombre    AS "aliasSobrenombre"',
        'exp.numJuzgadoCivico    AS "numJuzgadoCivico"',
        'exp.delitoImputado      AS "delitoImputado"',
        'exp.agraviado           AS "agraviado"',
        'exp.modalidadFalta      AS "modalidadFalta"',
        'exp.estatusProceso      AS "estatusProceso"',
        'exp.horasSentencia      AS "horasSentencia"',
        // Campos del beneficiario
        'ben.nombre              AS "nombre"',
        'ben.fechaIngreso        AS "fechaIngreso"',
        'ben.tiempoAsignado      AS "tiempoAsignado"',
        'ben.id                  AS "beneficiarioId"',
      ])
      // Solo expedientes cívicos activos (HORAS = cívico)
      .where('ben.unidadTiempo = :unidad', { unidad: 'HORAS' })
      .andWhere('exp.esActivo = true')
      .orderBy('ben.fechaIngreso', 'DESC')
      .getRawMany<CaratulaDto>();

    return rows;
  }

  // ── Carátula de un expediente específico ──────────────────────────
  // Útil para el header de la vista de perfil completo
  async findCaratula(idUUID: string): Promise<CaratulaDto> {
    const row = await this.expedienteRepo
      .createQueryBuilder('exp')
      .innerJoin(
        Beneficiario,
        'ben',
        'ben.id = exp.beneficiarioId',
      )
      .select([
        'exp.idUUID              AS "expedienteId"',
        'exp.folioExpediente  AS "folioExpediente"',
        'exp.causaPenal          AS "causaPenal"',
        'exp.aliasSobrenombre    AS "aliasSobrenombre"',
        'exp.numJuzgadoCivico    AS "numJuzgadoCivico"',
        'exp.delitoImputado      AS "delitoImputado"',
        'exp.agraviado           AS "agraviado"',
        'exp.modalidadFalta      AS "modalidadFalta"',
        'exp.estatusProceso      AS "estatusProceso"',
        'exp.horasSentencia      AS "horasSentencia"',
        'ben.nombre              AS "nombre"',
        'ben.fechaIngreso        AS "fechaIngreso"',
        'ben.tiempoAsignado      AS "tiempoAsignado"',
        'ben.id                  AS "beneficiarioId"',
      ])
      .where('exp.idUUID = :idUUID', { idUUID })
      .getRawOne<CaratulaDto>();

    if (!row) {
      throw new NotFoundException(
        `Carátula no encontrada para expediente ${idUUID}`,
      );
    }
    return row;
  }
}
import {
  Injectable,
  NotFoundException,
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

    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepo: Repository<Beneficiario>,
  ) {}

  async create(dto: CreateExpedienteCivicoDto): Promise<ExpedienteCivico> {
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

  async findAll(): Promise<ExpedienteCivico[]> {
    return this.expedienteRepo.find({
      order: { folioExpediente: 'DESC' },
    });
  }

  async findOne(idUUID: string): Promise<ExpedienteCivico> {
    const exp = await this.expedienteRepo.findOne({ where: { idUUID } });
    if (!exp) {
      throw new NotFoundException(`Expediente ${idUUID} no encontrado`);
    }
    return exp;
  }

  async findByCurp(curp: string): Promise<ExpedienteCivico> {
    const exp = await this.expedienteRepo.findOne({ where: { curp } });
    if (!exp) {
      throw new NotFoundException(`Expediente con CURP ${curp} no encontrado`);
    }
    return exp;
  }

  async update(
    idUUID: string,
    dto: UpdateExpedienteCivicoDto,
  ): Promise<ExpedienteCivico> {
    const exp = await this.findOne(idUUID);
    const actualizado = this.expedienteRepo.merge(exp, dto);
    return this.expedienteRepo.save(actualizado);
  }

  async deactivate(idUUID: string): Promise<ExpedienteCivico> {
    const exp = await this.findOne(idUUID);
    exp.esActivo = false;
    return this.expedienteRepo.save(exp);
  }

  async findAllCaratulas(): Promise<CaratulaDto[]> {
    const rows = await this.expedienteRepo
      .createQueryBuilder('exp')
      .innerJoin(Beneficiario, 'ben', 'ben.id = exp.beneficiarioId')
      .select([
        'exp.idUUID              AS "expedienteId"',
        'exp.folioExpediente     AS "folioExpediente"',
        'exp.causaPenal          AS "causaPenal"',
        'exp.aliasSobrenombre    AS "aliasSobrenombre"',
        'exp.numJuzgadoCivico    AS "numJuzgadoCivico"',
        'exp.delitoImputado      AS "delitoImputado"',
        'exp.agraviado           AS "agraviado"',
        'exp.modalidadFalta      AS "modalidadFalta"',
        'exp.estatusProceso      AS "estatusProceso"',
        'exp.horasSentencia      AS "horasSentencia"',
        'exp.avanceHoras         AS "avanceHoras"',
        'ben.nombre              AS "nombre"',
        'ben.fechaIngreso        AS "fechaIngreso"',
        'ben.tiempoAsignado      AS "tiempoAsignado"',
        'ben.id                  AS "beneficiarioId"',
      ])
      .where('ben.unidadTiempo = :unidad', { unidad: 'HORAS' })
      .andWhere('exp.esActivo = true')
      .orderBy('ben.fechaIngreso', 'DESC')
      .getRawMany<CaratulaDto>();

    return rows;
  }

  async findCaratula(idUUID: string): Promise<CaratulaDto> {
    const row = await this.expedienteRepo
      .createQueryBuilder('exp')
      .innerJoin(Beneficiario, 'ben', 'ben.id = exp.beneficiarioId')
      .select([
        'exp.idUUID              AS "expedienteId"',
        'exp.folioExpediente     AS "folioExpediente"',
        'exp.causaPenal          AS "causaPenal"',
        'exp.aliasSobrenombre    AS "aliasSobrenombre"',
        'exp.numJuzgadoCivico    AS "numJuzgadoCivico"',
        'exp.delitoImputado      AS "delitoImputado"',
        'exp.agraviado           AS "agraviado"',
        'exp.modalidadFalta      AS "modalidadFalta"',
        'exp.estatusProceso      AS "estatusProceso"',
        'exp.horasSentencia      AS "horasSentencia"',
        'exp.avanceHoras         AS "avanceHoras"',
        'ben.nombre              AS "nombre"',
        'ben.fechaIngreso        AS "fechaIngreso"',
        'ben.tiempoAsignado      AS "tiempoAsignado"',
        'ben.id                  AS "beneficiarioId"',
      ])
      .where('exp.idUUID = :idUUID', { idUUID })
      .getRawOne<CaratulaDto>();

    if (!row) {
      throw new NotFoundException(`Carátula no encontrada para expediente ${idUUID}`);
    }
    return row;
  }
}
import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { ExpedienteCivico } from './expediente-civico.entity';
  import { CreateExpedienteCivicoDto } from './dto/create-expediente-civico.dto';
  import { UpdateExpedienteCivicoDto } from './dto/update-expediente-civico.dto';
  
  @Injectable()
  export class ExpedientesCivicoService {
    constructor(
      @InjectRepository(ExpedienteCivico)
      private readonly expedienteRepo: Repository<ExpedienteCivico>,
    ) {}
  
    // ── Crear nuevo expediente cívico ─────────────────────────────────
    async create(dto: CreateExpedienteCivicoDto): Promise<ExpedienteCivico> {
      // RF-002: validar unicidad de CURP activa antes del alta
      const existeCurp = await this.expedienteRepo.findOne({
        where: { curp: dto.curp, esActivo: true },
      });
      if (existeCurp) {
        throw new ConflictException(
          `Ya existe un expediente activo con CURP: ${dto.curp}`,
        );
      }
  
      // Validar folio único
      const existeFolio = await this.expedienteRepo.findOne({
        where: { folioIncorporacion: dto.folioIncorporacion },
      });
      if (existeFolio) {
        throw new ConflictException(
          `El folio de incorporación ya está registrado: ${dto.folioIncorporacion}`,
        );
      }
  
      const expediente = this.expedienteRepo.create(dto);
      return this.expedienteRepo.save(expediente);
    }
  
    // ── Listar todos (con paginación básica) ──────────────────────────
    async findAll(): Promise<ExpedienteCivico[]> {
      return this.expedienteRepo.find({
        order: { creadoEn: 'DESC' },
      });
    }
  
    // ── Buscar por UUID ───────────────────────────────────────────────
    async findOne(idUUID: string): Promise<ExpedienteCivico> {
      const expediente = await this.expedienteRepo.findOne({
        where: { idUUID },
      });
      if (!expediente) {
        throw new NotFoundException(`Expediente con ID ${idUUID} no encontrado`);
      }
      return expediente;
    }
  
    // ── Buscar por CURP ───────────────────────────────────────────────
    async findByCurp(curp: string): Promise<ExpedienteCivico[]> {
      return this.expedienteRepo.find({ where: { curp } });
    }
  
    // ── Actualizar expediente (PATCH) ─────────────────────────────────
    async update(
      idUUID: string,
      dto: UpdateExpedienteCivicoDto,
    ): Promise<ExpedienteCivico> {
      const expediente = await this.findOne(idUUID);
      const actualizado = this.expedienteRepo.merge(expediente, dto);
      return this.expedienteRepo.save(actualizado);
    }
  
    // ── Baja lógica (soft delete) ─────────────────────────────────────
    async deactivate(idUUID: string): Promise<ExpedienteCivico> {
      const expediente = await this.findOne(idUUID);
      expediente.esActivo = false;
      return this.expedienteRepo.save(expediente);
    }
  }
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { OficioGenerado } from './oficio-generado.entity';
  import { CreateOficioGeneradoDto } from './dto/create-oficio-generado.dto';
  import { TipoDocumentoEnum } from '../enums/civico.enums';
  
  @Injectable()
  export class OficiosService {
    constructor(
      @InjectRepository(OficioGenerado)
      private readonly oficioRepo: Repository<OficioGenerado>,
    ) {}
  
    // ── Registrar nuevo oficio ────────────────────────────────────────
    async create(dto: CreateOficioGeneradoDto): Promise<OficioGenerado> {
      // Validar folio único
      const existeFolio = await this.oficioRepo.findOne({
        where: { folioOficio: dto.folioOficio },
      });
      if (existeFolio) {
        throw new ConflictException(
          `El folio de oficio ya existe: ${dto.folioOficio}`,
        );
      }
  
      const oficio = this.oficioRepo.create(dto);
      return this.oficioRepo.save(oficio);
    }
  
    // ── Listar todos los oficios de un expediente ─────────────────────
    async findByExpediente(expedienteId: string): Promise<OficioGenerado[]> {
      return this.oficioRepo.find({
        where: { expedienteId },
        order: { fechaGeneracion: 'DESC' },
      });
    }
  
    // ── Filtrar por tipo de documento ─────────────────────────────────
    async findByTipo(
      expedienteId: string,
      tipo: TipoDocumentoEnum,
    ): Promise<OficioGenerado[]> {
      return this.oficioRepo.find({
        where: { expedienteId, tipoDocumento: tipo },
        order: { fechaGeneracion: 'DESC' },
      });
    }
  
    // ── Obtener oficio por UUID ───────────────────────────────────────
    async findOne(idUUID: string): Promise<OficioGenerado> {
      const oficio = await this.oficioRepo.findOne({ where: { idUUID } });
      if (!oficio) {
        throw new NotFoundException(`Oficio ${idUUID} no encontrado`);
      }
      return oficio;
    }
  
    // ── Obtener oficio por folio ──────────────────────────────────────
    async findByFolio(folioOficio: string): Promise<OficioGenerado> {
      const oficio = await this.oficioRepo.findOne({ where: { folioOficio } });
      if (!oficio) {
        throw new NotFoundException(`Oficio con folio ${folioOficio} no encontrado`);
      }
      return oficio;
    }
  
  }
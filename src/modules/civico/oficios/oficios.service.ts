import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { In, Repository } from 'typeorm';
  import { OficioGenerado } from './oficio-generado.entity';
  import { BitacoraCivica } from '../bitacora/bitacora-civica.entity';
  import { CreateOficioGeneradoDto } from './dto/create-oficio-generado.dto';
  import { TipoDocumentoEnum } from '../enums/civico.enums';

  /** Tipos de documento requeridos para subir al Google Forms federal */
  const TIPOS_PAQUETE_FORMS: TipoDocumentoEnum[] = [
    TipoDocumentoEnum.OFICIO_INCORPORACION,
    TipoDocumentoEnum.OFICIO_CANALIZACION,
    TipoDocumentoEnum.F4_CEDULA_INICIAL,
    TipoDocumentoEnum.F3_PLAN_TRABAJO,
    TipoDocumentoEnum.PLAN_VIDA,
    TipoDocumentoEnum.REPORTE_SEMANAL_GUIA,
  ];

  export interface PaqueteFormsResponse {
    oficios: OficioGenerado[];
    fotosActividades: string[];
  }
  
  @Injectable()
  export class OficiosService {
    constructor(
      @InjectRepository(OficioGenerado)
      private readonly oficioRepo: Repository<OficioGenerado>,

      @InjectRepository(BitacoraCivica)
      private readonly bitacoraRepo: Repository<BitacoraCivica>,
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

    // ── Paquete para Google Forms federal ────────────────────────────
    // Retorna los documentos requeridos por el Forms federal y las URLs
    // de evidencia fotográfica registradas en bitácora.
    async findPaqueteForms(expedienteId: string): Promise<PaqueteFormsResponse> {
      const oficios = await this.oficioRepo.find({
        where: { expedienteId, tipoDocumento: In(TIPOS_PAQUETE_FORMS) },
        order: { fechaGeneracion: 'DESC' },
      });

      const bitacoras = await this.bitacoraRepo.find({
        where: { expedienteId },
        select: ['evidenciaUrl'],
      });

      const fotosActividades = bitacoras
        .map((b) => b.evidenciaUrl)
        .filter((url): url is string => url != null);

      return { oficios, fotosActividades };
    }

  }
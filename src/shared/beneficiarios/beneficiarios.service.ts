import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Beneficiario } from './beneficiario.entity';
  import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
  import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
  
  @Injectable()
  export class BeneficiariosService {
  
    constructor(
      @InjectRepository(Beneficiario)
      private readonly beneficiarioRepository: Repository<Beneficiario>,
    ) {}
  
    // ── RF-001: Crear nuevo beneficiario ──────────────────────────────
    async create(dto: CreateBeneficiarioDto): Promise<Beneficiario> {
      const nuevo = this.beneficiarioRepository.create(dto);
      return await this.beneficiarioRepository.save(nuevo);
    }
  
    // ── Obtener todos los beneficiarios ───────────────────────────────
    async findAll(): Promise<Beneficiario[]> {
      return await this.beneficiarioRepository.find({
        order: { creadoEn: 'DESC' }, // Los más recientes primero
      });
    }
  
    // ── Filtrar por unidad de tiempo (HORAS = Cívico / MESES = Penal) ─
    async findByUnidad(unidad: string): Promise<Beneficiario[]> {
      return await this.beneficiarioRepository.find({
        where: { unidadTiempo: unidad as any },
        order: { creadoEn: 'DESC' },
      });
    }
  
    // ── Obtener uno por ID ────────────────────────────────────────────
    async findOne(id: number): Promise<Beneficiario> {
      const beneficiario = await this.beneficiarioRepository.findOne({
        where: { id },
      });
      if (!beneficiario) {
        throw new NotFoundException(`Beneficiario con ID ${id} no encontrado`);
      }
      return beneficiario;
    }
  
    // ── Actualizar ────────────────────────────────────────────────────
    async update(
      id: number,
      dto: UpdateBeneficiarioDto,
    ): Promise<Beneficiario> {
      const beneficiario = await this.findOne(id);
      Object.assign(beneficiario, dto);
      return await this.beneficiarioRepository.save(beneficiario);
    }
  
    // ── Eliminar ──────────────────────────────────────────────────────
    // no usar en producción, solo para pruebas o si se requiere eliminar un beneficiario sin expediente activo. (RNF-004 ON DELETE RESTRICT)
    // La BD lo bloqueará automáticamente cuando existan expedientes relacionados.
    async remove(id: number): Promise<{ message: string }> {
      const beneficiario = await this.findOne(id);
      await this.beneficiarioRepository.remove(beneficiario);
      return {
        message: `Beneficiario con ID ${id} eliminado correctamente`,
      };
    }
  }
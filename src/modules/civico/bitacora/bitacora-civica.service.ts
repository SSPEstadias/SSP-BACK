import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { BitacoraCivica } from './bitacora-civica.entity';
  import { CreateBitacoraCivicaDto } from './dto/create-bitacora-civica.dto';
  
  @Injectable()
  export class BitacoraCivicaService {
    constructor(
      @InjectRepository(BitacoraCivica)
      private readonly bitacoraRepo: Repository<BitacoraCivica>,
    ) {}
  
    // ── Registrar entrada en bitácora ─────────────────────────────────
    async create(dto: CreateBitacoraCivicaDto): Promise<BitacoraCivica> {
      // Validación: si no asistió, debe indicar motivo
      if (dto.asistencia === false && !dto.motivoFalta) {
        throw new BadRequestException(
          'Debe indicar motivo_falta cuando asistencia es false',
        );
      }
  
      const registro = this.bitacoraRepo.create(dto);
      return this.bitacoraRepo.save(registro);
    }
  
    // ── Listar todos los registros de un expediente ───────────────────
    async findByExpediente(expedienteId: string): Promise<BitacoraCivica[]> {
      return this.bitacoraRepo.find({
        where: { expedienteId },
        order: { fechaActividad: 'DESC' },
      });
    }
  
    // ── Obtener registro por ID ───────────────────────────────────────
    async findOne(idUUID: string): Promise<BitacoraCivica> {
      const registro = await this.bitacoraRepo.findOne({ where: { idUUID } });
      if (!registro) {
        throw new NotFoundException(`Registro de bitácora ${idUUID} no encontrado`);
      }
      return registro;
    }
  
    // ── Calcular total de horas acumuladas por expediente ─────────────
    // RF-010: reemplaza el Excel ControldeHoras
    async calcularHorasAcumuladas(expedienteId: string): Promise<number> {
      const result = await this.bitacoraRepo
        .createQueryBuilder('b')
        .select('SUM(b.horasCubiertas)', 'total')
        .where('b.expedienteId = :expedienteId', { expedienteId })
        .andWhere('b.asistencia = true')
        .getRawOne<{ total: string }>();
  
      return parseFloat(result?.total ?? '0');
    }
  
    // ── Eliminar registro (solo admin) ───────────────────────────────
    async remove(idUUID: string): Promise<void> {
      const registro = await this.findOne(idUUID);
      await this.bitacoraRepo.remove(registro);
    }
  }
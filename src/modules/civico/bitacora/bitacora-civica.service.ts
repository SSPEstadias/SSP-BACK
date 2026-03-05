import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraCivica } from './bitacora-civica.entity';
import { CreateBitacoraCivicaDto } from './dto/create-bitacora-civica.dto';
import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { Actividad } from '../../../shared/actividades/actividad.entity';
import { Salud } from '../../../shared/salud/salud.entity';

@Injectable()
export class BitacoraCivicaService {
  constructor(
    @InjectRepository(BitacoraCivica)
    private readonly bitacoraRepo: Repository<BitacoraCivica>,

    // Necesitamos leer el expediente → beneficiarioId → perfil de salud
    @InjectRepository(ExpedienteCivico)
    private readonly expedienteRepo: Repository<ExpedienteCivico>,

    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,

    @InjectRepository(Salud)
    private readonly saludRepo: Repository<Salud>,
  ) {}

  // ── Registrar entrada en bitácora ─────────────────────────────────
  async create(dto: CreateBitacoraCivicaDto): Promise<BitacoraCivica> {

    // 1. Validar que si no asistió, venga motivo
    if (dto.asistencia === false && !dto.motivoFalta) {
      throw new BadRequestException(
        'Debe indicar motivoFalta cuando asistencia es false',
      );
    }

    // 2. Si asistió, validar restricciones de salud por categoría de actividad
    if (dto.asistencia !== false) {
      await this.validarRestriccionSalud(dto);
    }

    const registro = this.bitacoraRepo.create(dto);
    return this.bitacoraRepo.save(registro);
  }

  // ── Validación de salud: actividad compatible con perfil físico ───
  private async validarRestriccionSalud(dto: CreateBitacoraCivicaDto): Promise<void> {

    // Obtener el expediente para saber el beneficiarioId
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });
    if (!expediente) {
      throw new NotFoundException(`Expediente ${dto.expedienteId} no encontrado`);
    }

    // Obtener el perfil de salud del beneficiario
    const salud = await this.saludRepo.findOne({
      where: { beneficiarioId: expediente.beneficiarioId },
    });

    // Si no tiene perfil de salud aún → advertencia pero no bloquea
    // (puede pasar si el perfil se llena después, en etapas tempranas)
    if (!salud) return;

    // Si no es apto físico en absoluto → bloquear cualquier actividad con asistencia
    if (!salud.esAptoFisico) {
      throw new BadRequestException(
        'El beneficiario no está apto físicamente para realizar actividades. ' +
        'Actualice su perfil de salud antes de registrar asistencia.',
      );
    }

    // Si hay restricciones por categoría → verificar la actividad asignada
    if (
      salud.restriccionesCategorias &&
      salud.restriccionesCategorias.length > 0
    ) {
      // Obtener la categoría de la actividad del catálogo
      const actividad = await this.actividadRepo.findOne({
        where: { id: dto.actividadId },
      });
      if (!actividad) {
        throw new NotFoundException(`Actividad ${dto.actividadId} no encontrada`);
      }

      if (
        actividad.categoria &&
        salud.restriccionesCategorias.includes(actividad.categoria)
      ) {
        throw new BadRequestException(
          `La actividad "${actividad.nombre}" pertenece a la categoría ` +
          `${actividad.categoria}, la cual está restringida para este beneficiario ` +
          `por su condición de salud. Asigne una actividad de otra categoría.`,
        );
      }
    }
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

  // ── RF-010: Total de horas acumuladas con asistencia ─────────────
  async calcularHorasAcumuladas(expedienteId: string): Promise<number> {
    const result = await this.bitacoraRepo
      .createQueryBuilder('b')
      .select('SUM(b.horasCubiertas)', 'total')
      .where('b.expedienteId = :expedienteId', { expedienteId })
      .andWhere('b.asistencia = true')
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total ?? '0');
  }

  // ── Eliminar registro (solo Admin) ───────────────────────────────
  async remove(idUUID: string): Promise<void> {
    const registro = await this.findOne(idUUID);
    await this.bitacoraRepo.remove(registro);
  }
}
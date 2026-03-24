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
import { AsistenciaEnum, IncidenciaTipoEnum, CivicStatusEnum } from '../enums/civico.enums';

@Injectable()
export class BitacoraCivicaService {
  constructor(
    @InjectRepository(BitacoraCivica)
    private readonly bitacoraRepo: Repository<BitacoraCivica>,

    @InjectRepository(ExpedienteCivico)
    private readonly expedienteRepo: Repository<ExpedienteCivico>,

    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,

    @InjectRepository(Salud)
    private readonly saludRepo: Repository<Salud>,
  ) {}

  // ── Registrar entrada en bitácora ─────────────────────────────────
  async create(dto: CreateBitacoraCivicaDto): Promise<BitacoraCivica> {
    // 1. Validar que el expediente exista
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });

    if (!expediente) {
      throw new BadRequestException(
        `Expediente ${dto.expedienteId} no encontrado`,
      );
    }

    // 2. Validar que si asistencia es FALTA_INJUSTIFICADA, horasCubiertas = 0
    if (
      dto.asistencia === AsistenciaEnum.FALTA_INJUSTIFICADA &&
      dto.horasCubiertas !== 0
    ) {
      throw new BadRequestException(
        'Si la asistencia es FALTA_INJUSTIFICADA, las horas cubiertas deben ser 0',
      );
    }

    // 3. Validar que si hay incidencia, detalleIncidencia es obligatorio
    if (dto.incidencia && !dto.detalleIncidencia) {
      throw new BadRequestException(
        'Si hay incidencia, detalleIncidencia es obligatorio',
      );
    }

    // 4. Si asistió, validar restricciones de salud
    if (dto.asistencia === AsistenciaEnum.PRESENTE || 
        dto.asistencia === AsistenciaEnum.PRESENTE_PARCIAL) {
      await this.validarRestriccionSalud(dto);
    }

    // 5. Crear el registro
    const registro = this.bitacoraRepo.create(dto);
    const saved = await this.bitacoraRepo.save(registro);

    // 6. ✅ IMPORTANTE: Si hay asistencia, sumar horas al expediente
    if (
      (dto.asistencia === AsistenciaEnum.PRESENTE ||
        dto.asistencia === AsistenciaEnum.PRESENTE_PARCIAL) &&
      dto.horasCubiertas > 0
    ) {
      const nuevasHoras =
        (expediente.avanceHoras || 0) + dto.horasCubiertas;
      expediente.avanceHoras = nuevasHoras;

      // Verificar si llegó a las horas requeridas
      if (
        expediente.horasSentencia &&
        nuevasHoras >= expediente.horasSentencia
      ) {
        expediente.estatusProceso= CivicStatusEnum.GRADUADO;
      }

      await this.expedienteRepo.save(expediente);
    }

    // 7. ✅ IMPORTANTE: Contar incidencias y aplicar BAJA si llega a 3
    if (dto.incidencia) {
      const incidenciasCount = await this.bitacoraRepo.count({
        where: {
          expedienteId: dto.expedienteId,
          incidencia: dto.incidencia,
        },
      });

      // Si es la tercera incidencia → aplicar BAJA automática
      if (incidenciasCount >= 3) {
        expediente.estatusProceso =
          CivicStatusEnum.BAJA_POR_ACUMULACION_DE_INCIDENCIAS;
        await this.expedienteRepo.save(expediente);
      }
    }

    return saved;
  }

  // ── Validación de salud: actividad compatible con perfil físico ───
  private async validarRestriccionSalud(
    dto: CreateBitacoraCivicaDto,
  ): Promise<void> {
    // Obtener el expediente
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });
    if (!expediente) {
      throw new NotFoundException(`Expediente ${dto.expedienteId} no encontrado`);
    }

    // Obtener el perfil de salud
    const salud = await this.saludRepo.findOne({
      where: { beneficiarioId: expediente.beneficiarioId },
    });

    // Si no tiene perfil de salud → advertencia pero no bloquea
    if (!salud) return;

    // Si no es apto físico → bloquear
    if (!salud.esAptoFisico) {
      throw new BadRequestException(
        'El beneficiario no está apto físicamente para realizar actividades. ' +
          'Actualice su perfil de salud antes de registrar asistencia.',
      );
    }

    // Si hay restricciones por categoría → verificar
    if (
      salud.restriccionesCategorias &&
      salud.restriccionesCategorias.length > 0
    ) {
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
            `${actividad.categoria}, la cual está restringida para este beneficiario.`,
        );
      }
    }
  }

  // ── Listar registros de un expediente ───────────────────────────
  async findByExpediente(expedienteId: string): Promise<BitacoraCivica[]> {
    return this.bitacoraRepo.find({
      where: { expedienteId },
      order: { fechaActividad: 'DESC' },
    });
  }

  // ── Obtener un registro ────────────────────────────────────────────
  async findOne(idUUID: string): Promise<BitacoraCivica> {
    const registro = await this.bitacoraRepo.findOne({ where: { idUUID } });
    if (!registro) {
      throw new NotFoundException(`Bitácora ${idUUID} no encontrada`);
    }
    return registro;
  }

  // ── Calcular horas acumuladas ──────────────────────────────────────
  async calcularHorasAcumuladas(expedienteId: string): Promise<number> {
    const result = await this.bitacoraRepo
      .createQueryBuilder('b')
      .select('SUM(b.horasCubiertas)', 'total')
      .where('b.expedienteId = :expedienteId', { expedienteId })
      .andWhere(
        'b.asistencia IN (:...asistencias)',
        {
          asistencias: [
            AsistenciaEnum.PRESENTE,
            AsistenciaEnum.PRESENTE_PARCIAL,
          ],
        },
      )
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total ?? '0');
  }

  // ── Eliminar registro ──────────────────────────────────────────────
  async remove(idUUID: string): Promise<void> {
    const registro = await this.findOne(idUUID);
    await this.bitacoraRepo.remove(registro);
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraCivica } from './bitacora-civica.entity';
import { CreateBitacoraCivicaDto } from './dto/create-bitacora-civica.dto';
import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { Actividad } from '../../../shared/actividades/actividad.entity';
import { Salud } from '../../../shared/salud/salud.entity';
import { IncidenciasService } from '../incidencias/incidencias.service';
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

    // ✅ NUEVO: Inyectar servicio de incidencias
    private readonly incidenciasService: IncidenciasService,
  ) {}

  // ── Registrar entrada en bitácora ─────────────────────────────────
  async create(dto: CreateBitacoraCivicaDto): Promise<BitacoraCivica> {
    // 1. Obtener expediente
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });

    if (!expediente) {
      throw new BadRequestException(`Expediente ${dto.expedienteId} no encontrado`);
    }

    // 2. Validación: FALTA_INJUSTIFICADA siempre tiene 0 horas
    if (
      dto.asistencia === AsistenciaEnum.FALTA_INJUSTIFICADA &&
      dto.horasCubiertas !== 0
    ) {
      throw new BadRequestException(
        'Si la asistencia es FALTA_INJUSTIFICADA, las horas cubiertas deben ser 0',
      );
    }

    // 3. Validación: Si hay incidencia, detalleIncidencia es obligatorio
    if (dto.incidencia && !dto.detalleIncidencia) {
      throw new BadRequestException(
        'Si hay incidencia, detalleIncidencia es obligatorio',
      );
    }

    // 4. Validar restricciones de salud si asistió
    if (dto.asistencia === AsistenciaEnum.PRESENTE || 
        dto.asistencia === AsistenciaEnum.PRESENTE_PARCIAL) {
      await this.validarRestriccionSalud(dto);
    }

    // 5. ✅ CREAR BITÁCORA
    const bitacora = this.bitacoraRepo.create(dto);
    const saved = await this.bitacoraRepo.save(bitacora);

    // 6. ✅ SI HAY INCIDENCIA EN LA BITÁCORA → CREAR TAMBIÉN EN TABLA INCIDENCIAS
    if (dto.incidencia) {
      await this.incidenciasService.create({
        expedienteId: dto.expedienteId,
        guiaId: dto.guiaId,
        tipo: dto.incidencia,
        descripcionHechos: dto.detalleIncidencia,  
        fechaIncidencia: dto.fechaActividad,
        esAcumulativa: true,
      });
    }

    // 7. ✅ ACTUALIZAR EXPEDIENTE (UNA SOLA VEZ al final)
    let cambios = false;

    // Sumar horas si hubo asistencia
    if (
      (dto.asistencia === AsistenciaEnum.PRESENTE ||
        dto.asistencia === AsistenciaEnum.PRESENTE_PARCIAL) &&
      dto.horasCubiertas > 0
    ) {
      expediente.avanceHoras =
        (expediente.avanceHoras || 0) + dto.horasCubiertas;

      // Verificar si llegó a las horas requeridas
      if (
        expediente.horasSentencia &&
        expediente.avanceHoras >= expediente.horasSentencia
      ) {
        expediente.estatusProceso = CivicStatusEnum.GRADUADO;
      }

      cambios = true;
    }

    // Contar incidencias acumulativas y aplicar BAJA si >= 3
    if (dto.incidencia) {
      const incidenciasCount = await this.bitacoraRepo.count({
        where: {
          expedienteId: dto.expedienteId,
          incidencia: dto.incidencia,
        },
      });

      if (incidenciasCount >= 3) {
        expediente.estatusProceso =
          CivicStatusEnum.BAJA_POR_ACUMULACION_DE_INCIDENCIAS;
        cambios = true;
      }
    }

    // ✅ Guardar expediente CON TODOS los cambios
    if (cambios) {
      await this.expedienteRepo.save(expediente);
    }

    return saved;
  }

  // ── Validación de salud ────────────────────────────────────────────
  private async validarRestriccionSalud(
    dto: CreateBitacoraCivicaDto,
  ): Promise<void> {
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });
    if (!expediente) {
      throw new NotFoundException(`Expediente ${dto.expedienteId} no encontrado`);
    }

    const salud = await this.saludRepo.findOne({
      where: { beneficiarioId: expediente.beneficiarioId },
    });

    if (!salud) return; // Si no tiene perfil de salud, no bloquea

    if (!salud.esAptoFisico) {
      throw new BadRequestException(
        'El beneficiario no está apto físicamente para realizar actividades.',
      );
    }

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
          `La actividad "${actividad.nombre}" está restringida para este beneficiario.`,
        );
      }
    }
  }

  async findByExpediente(expedienteId: string): Promise<BitacoraCivica[]> {
    return this.bitacoraRepo.find({
      where: { expedienteId },
      order: { fechaActividad: 'DESC' },
    });
  }

  async findOne(idUUID: string): Promise<BitacoraCivica> {
    const registro = await this.bitacoraRepo.findOne({ where: { idUUID } });
    if (!registro) {
      throw new NotFoundException(`Bitácora ${idUUID} no encontrada`);
    }
    return registro;
  }

  async calcularHorasAcumuladas(expedienteId: string): Promise<number> {
    const result = await this.bitacoraRepo
      .createQueryBuilder('b')
      .select('SUM(b.horasCubiertas)', 'total')
      .where('b.expedienteId = :expedienteId', { expedienteId })
      .andWhere('b.asistencia IN (:...asistencias)', {
        asistencias: [
          AsistenciaEnum.PRESENTE,
          AsistenciaEnum.PRESENTE_PARCIAL,
        ],
      })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total ?? '0');
  }

  async remove(idUUID: string): Promise<void> {
    const registro = await this.findOne(idUUID);
    await this.bitacoraRepo.remove(registro);
  }
}
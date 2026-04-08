import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraCivica } from './bitacora-civica.entity';
import { CreateBitacoraCivicaDto } from './dto/create-bitacora-civica.dto';
import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { Actividad } from '../../../shared/actividades/actividad.entity';
import { Salud } from '../../../shared/salud/salud.entity';
import { IncidenciasService } from '../incidencias/incidencias.service';
import { EntrevistaClinica } from '../f1-entrevista/entrevista-clinica.entity';
import { EstudioSocioeconomico } from '../f2-estudio/estudio-socioeconomico.entity';
import { PlanTrabajo } from '../f3-plan/plan-trabajo.entity';
import { CedulaInicial } from '../f4-cedula/cedula-inicial';
import { AsistenciaEnum, IncidenciaTipoEnum, CivicStatusEnum, FormStatusEnum } from '../enums/civico.enums';
import { User, RolUsuario } from '../../../shared/users/entities/user.entity';

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

    @InjectRepository(EntrevistaClinica)
    private readonly f1Repo: Repository<EntrevistaClinica>,

    @InjectRepository(EstudioSocioeconomico)
    private readonly f2Repo: Repository<EstudioSocioeconomico>,

    @InjectRepository(PlanTrabajo)
    private readonly f3Repo: Repository<PlanTrabajo>,

    @InjectRepository(CedulaInicial)
    private readonly f4Repo: Repository<CedulaInicial>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly incidenciasService: IncidenciasService,
  ) {}

  async create(dto: CreateBitacoraCivicaDto): Promise<BitacoraCivica> {
    const expediente = await this.expedienteRepo.findOne({
      where: { idUUID: dto.expedienteId },
    });

    if (!expediente) {
      throw new BadRequestException(`Expediente ${dto.expedienteId} no encontrado`);
    }

    const guia = await this.userRepo.findOne({ where: { id: dto.guiaId } });
    if (!guia) {
      throw new BadRequestException(`Usuario ${dto.guiaId} no encontrado`);
    }
    if (guia.rol !== RolUsuario.GUIA) {
      throw new BadRequestException(
        `El usuario ${dto.guiaId} tiene rol "${guia.rol}", no es un Guía. Solo usuarios con rol "guia" pueden registrarse como guía en la bitácora.`,
      );
    }

    if (
      dto.asistencia === AsistenciaEnum.FALTA_INJUSTIFICADA &&
      dto.horasCubiertas !== 0
    ) {
      throw new BadRequestException(
        'Si la asistencia es FALTA_INJUSTIFICADA, las horas cubiertas deben ser 0',
      );
    }

    if (dto.incidencia && !dto.detalleIncidencia) {
      throw new BadRequestException(
        'Si hay incidencia, detalleIncidencia es obligatorio',
      );
    }

    if (dto.asistencia === AsistenciaEnum.PRESENTE || 
        dto.asistencia === AsistenciaEnum.PRESENTE_PARCIAL) {
      await this.validarRestriccionSalud(dto);
    }

    const bitacora = this.bitacoraRepo.create(dto);
    const saved = await this.bitacoraRepo.save(bitacora);

    // Si hay incidencia en la bitácora, también se registra en la tabla de incidencias
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

    let cambios = false;

    if (
      (dto.asistencia === AsistenciaEnum.PRESENTE ||
        dto.asistencia === AsistenciaEnum.PRESENTE_PARCIAL) &&
      dto.horasCubiertas > 0
    ) {
      // TypeORM devuelve columnas DECIMAL como string desde PostgreSQL, hay que parsear
      const avanceActual = parseFloat(String(expediente.avanceHoras ?? 0));
      const horasNuevas = Number(dto.horasCubiertas);
      const nuevoAvance = avanceActual + horasNuevas;
      expediente.avanceHoras = nuevoAvance;

      if (expediente.horasSentencia && nuevoAvance >= Number(expediente.horasSentencia)) {
        const listoParaGraduado = await this.verificarRequisitosGraduacion(dto.expedienteId);
        if (listoParaGraduado) {
          expediente.estatusProceso = CivicStatusEnum.GRADUADO;
        }
      }

      cambios = true;
    }

    // Tres incidencias acumuladas disparan la baja automática
    if (dto.incidencia) {
      const totalIncidencias = await this.bitacoraRepo.count({
        where: { expedienteId: dto.expedienteId },
      });

      if (totalIncidencias >= 3) {
        expediente.estatusProceso = CivicStatusEnum.BAJA_POR_ACUMULACION_DE_INCIDENCIAS;
        cambios = true;
      }
    }

    if (cambios) {
      await this.expedienteRepo.save(expediente);
    }

    return saved;
  }

  // Todos los formularios (F1-F4) deben estar COMPLETADO o CERRADO, y el F5 marcado como cerrado en el expediente.
  private async verificarRequisitosGraduacion(expedienteId: string): Promise<boolean> {
    const [exp, f1, f2, f3, f4] = await Promise.all([
      this.expedienteRepo.findOne({ where: { idUUID: expedienteId } }),
      this.f1Repo.findOne({ where: { expedienteId } }),
      this.f2Repo.findOne({ where: { expedienteId } }),
      this.f3Repo.findOne({ where: { expedienteId } }),
      this.f4Repo.findOne({ where: { expedienteId } }),
    ]);

    if (!exp || !exp.estatusF5Cerrado) return false;

    const isClosed = (status?: FormStatusEnum) =>
      status === FormStatusEnum.COMPLETADO || status === FormStatusEnum.CERRADO;

    return (
      isClosed(f1?.estatusF1) &&
      isClosed(f2?.estatusF2) &&
      isClosed(f3?.estatusF3) &&
      isClosed(f4?.estatusF4)
    );
  }


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
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';
import { EntrevistaClinica } from '../f1-entrevista/entrevista-clinica.entity';
import { PlanTrabajo } from '../f3-plan/plan-trabajo.entity';
import { CedulaInicial } from '../f4-cedula/cedula-inicial';
import { Incidencia } from '../incidencias/incidencia.entity';
import { BitacoraCivica } from '../bitacora/bitacora-civica.entity';
import { User } from '../../../shared/users/entities/user.entity';
import { AsistenciaEnum } from '../enums/civico.enums';

/**
 * Resuelve el directorio raíz del módulo de documentos.
 * Prueba primero `__dirname` (dist/ tras nest build) y luego la ruta fuente
 * (src/) como respaldo, de modo que la aplicación funcione con cualquier
 * variante de inicio (nest start, nest start:dev, start:prod).
 */
function resolveDocumentosRoot(): string {
  // En producción __dirname apunta a dist/modules/civico/documentos
  if (fs.existsSync(path.join(__dirname, 'templates'))) {
    return __dirname;
  }
  // Respaldo: busca desde la raíz del proyecto hacia src/
  const srcRoot = path.join(process.cwd(), 'src', 'modules', 'civico', 'documentos');
  if (fs.existsSync(path.join(srcRoot, 'templates'))) {
    return srcRoot;
  }
  // Último recurso: usar __dirname (lanzará el error descriptivo si no existe)
  return __dirname;
}

/** Convierte una ruta de archivo local a data URI base64. */
function toDataUri(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

/** Formatea Date o string de fecha a dd/mm/yyyy */
function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Ciudad y fecha larga en español */
function fechaLarga(): string {
  return new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

@Injectable()
export class DocumentosService implements OnModuleInit {
  // ── Logos precargados como data URI ────────────────────────────────
  private logoEncabezado!: string;
  private marcaAgua!: string;

  constructor(
    @InjectRepository(ExpedienteCivico)
    private readonly expedienteRepo: Repository<ExpedienteCivico>,

    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepo: Repository<Beneficiario>,

    @InjectRepository(EntrevistaClinica)
    private readonly f1Repo: Repository<EntrevistaClinica>,

    @InjectRepository(PlanTrabajo)
    private readonly f3Repo: Repository<PlanTrabajo>,

    @InjectRepository(CedulaInicial)
    private readonly f4Repo: Repository<CedulaInicial>,

    @InjectRepository(Incidencia)
    private readonly incidenciaRepo: Repository<Incidencia>,

    @InjectRepository(BitacoraCivica)
    private readonly bitacoraRepo: Repository<BitacoraCivica>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── Inicialización: logos + partials + helpers ──────────────────────
  onModuleInit(): void {
    const docRoot = resolveDocumentosRoot();
    const assetsDir = path.join(docRoot, 'assets');

    // Cargar logos — los nombres de archivo se mantienen tal como están en el repo.
    // Fallback a string vacío si el archivo no existe en el entorno de despliegue.
    const logoPath = path.normalize(path.join(
      assetsDir,
      'logoencabezado_con_margen_derecho(junto 1 sola imagen).png',
    ));
    const marcaPath = path.normalize(path.join(
      assetsDir,
      'LOGO_RECONECTACONLAPAZ_MARCADE AGUA FONDO EN TODOS LOS ARCHIVOS.jpg',
    ));

    this.logoEncabezado = fs.existsSync(logoPath) ? toDataUri(logoPath) : '';
    this.marcaAgua = fs.existsSync(marcaPath) ? toDataUri(marcaPath) : '';

    // Registrar partials HBS
    const partialsDir = path.join(docRoot, 'partials');
    if (fs.existsSync(partialsDir)) {
      for (const file of fs.readdirSync(partialsDir)) {
        if (file.endsWith('.hbs')) {
          const name = path.basename(file, '.hbs');
          const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8');
          Handlebars.registerPartial(name, content);
        }
      }
    }

    // ── Helpers de Handlebars ─────────────────────────────────────────

    // {{formatDate value}} → dd/mm/yyyy
    if (!Handlebars.helpers['formatDate']) {
      Handlebars.registerHelper('formatDate', (value: unknown) =>
        formatDate(value as Date | string | null),
      );
    }

    // {{add @index 1}} → incrementa números en #each
    if (!Handlebars.helpers['add']) {
      Handlebars.registerHelper('add', (a: number, b: number) => a + b);
    }

    // {{eq a b}} → comparación de igualdad para #if
    if (!Handlebars.helpers['eq']) {
      Handlebars.registerHelper('eq', function (
        this: unknown,
        a: unknown,
        b: unknown,
        options: Handlebars.HelperOptions,
      ) {
        return a === b ? options.fn(this) : options.inverse(this);
      });
    }

    // {{times n}} → repite un bloque n veces
    if (!Handlebars.helpers['times']) {
      Handlebars.registerHelper('times', function (
        this: unknown,
        n: number,
        options: Handlebars.HelperOptions,
      ) {
        let result = '';
        for (let i = 0; i < n; i++) {
          result += options.fn(this);
        }
        return result;
      });
    }
  }

  // ── Contexto base con logos (se mezcla en cada template) ───────────
  private baseContext(): Record<string, string> {
    return {
      logoEncabezado: this.logoEncabezado,
      marcaAgua: this.marcaAgua,
      ciudad: 'Oaxaca de Juárez, Oaxaca',
      firmaNombre: 'LIC. NOMBRE DEL TITULAR',
      firmaCargo: 'Coordinador del Programa Reconecta con la Paz',
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Método central: template → PDF en Buffer ──────────────────────
  // ══════════════════════════════════════════════════════════════════

  /**
   * Compila el template HBS indicado con `datos` y genera un PDF.
   * @param tipoDocumento nombre del archivo sin extensión (ej: 'oficio_incorporacion')
   * @param datos         contexto para el template
   */
  async generarPdf(
    tipoDocumento: string,
    datos: Record<string, unknown>,
  ): Promise<Buffer> {
    const rutaTemplate = path.join(
      resolveDocumentosRoot(),
      'templates',
      `${tipoDocumento}.hbs`,
    );

    if (!fs.existsSync(rutaTemplate)) {
      throw new InternalServerErrorException(
        `Template no encontrado: ${tipoDocumento}.hbs`,
      );
    }

    const templateStr = fs.readFileSync(rutaTemplate, 'utf-8');
    const template = Handlebars.compile(templateStr);
    const htmlFinal = template({ ...this.baseContext(), ...datos });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Métodos específicos por tipo de documento ─────────────────────
  // ══════════════════════════════════════════════════════════════════

  /** Oficio de Incorporación al Programa */
  async generarOficioIncorporacion(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    const datos: Record<string, unknown> = {
      folioOficio: extras['folioOficio'] ?? `OFC-INCORP-${Date.now()}`,
      fechaGeneracion: fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      causaPenal: exp.causaPenal,
      delitoImputado: exp.delitoImputado ?? '—',
      horasSentencia: exp.horasSentencia,
      folioIncorporacion: exp.folioIncorporacion,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      juzgadoNombre: exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezControl: exp.juezControl ?? '—',
      juezNombre: exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargo: 'Juez Cívico',
      oficioCanalizacion: exp.oficioCanalizacion ?? '—',
      modalidadFalta: exp.modalidadFalta ?? '—',
      tituloDocumento: 'OFICIO DE INCORPORACIÓN AL PROGRAMA',
      ...extras,
    };

    return this.generarPdf('oficio_incorporacion', datos);
  }

  /** Oficio de Conclusión / Culminación */
  async generarOficioConclusion(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    // Calcular horas cumplidas desde bitácora
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);

    const datos: Record<string, unknown> = {
      folioOficio: extras['folioOficio'] ?? `OFC-CONCL-${Date.now()}`,
      fechaGeneracion: fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      causaPenal: exp.causaPenal,
      folioIncorporacion: exp.folioIncorporacion,
      horasSentencia: exp.horasSentencia,
      horasCumplidas,
      fechaInicio: formatDate(ben.fechaIngreso),
      fechaConclusion: fechaLarga(),
      juzgadoNombre: exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre: exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargo: 'Juez Cívico',
      tituloDocumento: 'OFICIO DE CONCLUSIÓN DEL PROGRAMA',
      actividades: extras['actividades'] ?? [],
      ...extras,
    };

    return this.generarPdf('oficio_conclusion', datos);
  }

  /** Informe de Baja Definitiva */
  async generarInformeBaja(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);

    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const datos: Record<string, unknown> = {
      folioOficio: extras['folioOficio'] ?? `OFC-BAJA-${Date.now()}`,
      fechaGeneracion: fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      causaPenal: exp.causaPenal,
      folioIncorporacion: exp.folioIncorporacion,
      horasSentencia: exp.horasSentencia,
      horasCumplidas,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      fechaBaja: fechaLarga(),
      motivoBaja: exp.estatusProceso,
      totalIncidencias: incidencias.length,
      juzgadoNombre: exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre: exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargo: 'Juez Cívico',
      tituloDocumento: 'INFORME DE BAJA DEFINITIVA',
      incidencias: incidencias.map((i) => ({
        tipo: i.tipo,
        fechaFormateada: formatDate(i.fechaIncidencia),
        descripcionHechos: i.descripcionHechos,
        esAcumulativa: i.esAcumulativa,
        estatusResolucion: i.estatusResolucion,
        numOficioNotificacion: i.numOficioNotificacion ?? '—',
      })),
      ...extras,
    };

    return this.generarPdf('oficio_baja_definitiva', datos);
  }

  /** Hoja de Presentación al Programa */
  async generarHojaPresentacion(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    const contactos = exp.contactosFamiliares as Record<string, { nombre: string; telefono: string }> | null;

    const datos: Record<string, unknown> = {
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      fechaNacimiento: formatDate(exp.fechaNacimiento),
      edad: calcularEdad(exp.fechaNacimiento),
      genero: exp.genero ?? '—',
      estadoCivil: exp.estadoCivil ?? '—',
      domicilio: exp.domicilioCompleto,
      municipio: exp.municipio ?? '—',
      telefono: exp.telefonoContacto ?? '—',
      escolaridad: exp.escolaridadActual ?? '—',
      ocupacion: exp.ocupacionActual ?? '—',
      lenguaIndigena: exp.lenguaIndigena,
      religion: exp.religion,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal: exp.causaPenal,
      juzgadoNombre: exp.numJuzgadoCivico ?? '—',
      juezControl: exp.juezControl ?? '—',
      delitoImputado: exp.delitoImputado ?? '—',
      modalidadFalta: exp.modalidadFalta ?? '—',
      oficioCanalizacion: exp.oficioCanalizacion ?? '—',
      horasSentencia: exp.horasSentencia,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      contactoPadre: contactos?.['padre'],
      contactoMadre: contactos?.['madre'],
      contactoTutor: contactos?.['tutor'],
      tituloDocumento: 'HOJA DE PRESENTACIÓN AL PROGRAMA',
      ...extras,
    };

    return this.generarPdf('hoja_presentacion', datos);
  }

  /** Ficha Técnica de Incidencias */
  async generarFichaIncidencias(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);

    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const totalStrikes = incidencias.filter((i) => i.esAcumulativa).length;

    const datos: Record<string, unknown> = {
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal: exp.causaPenal,
      horasSentencia: exp.horasSentencia,
      horasCumplidas,
      estatusProceso: exp.estatusProceso,
      fechaGeneracion: fechaLarga(),
      totalStrikes,
      totalIncidencias: incidencias.length,
      tituloDocumento: 'FICHA TÉCNICA DE INCIDENCIAS',
      incidencias: incidencias.map((i) => ({
        tipo: i.tipo,
        fechaFormateada: formatDate(i.fechaIncidencia),
        descripcionHechos: i.descripcionHechos,
        esAcumulativa: i.esAcumulativa,
        estatusResolucion: i.estatusResolucion,
        numOficioNotificacion: i.numOficioNotificacion ?? '—',
      })),
      ...extras,
    };

    return this.generarPdf('ficha_incidencias', datos);
  }

  /** F3 — Plan de Trabajo Individual */
  async generarF3PlanTrabajo(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f3 = await this.f3Repo.findOne({ where: { expedienteId } });

    if (!f3) {
      throw new NotFoundException(
        `No existe un F3 (Plan de Trabajo) para el expediente ${expedienteId}`,
      );
    }

    const coordinador = await this.userRepo.findOne({
      where: { id: f3.coordinadorId },
    });

    const datos: Record<string, unknown> = {
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal: exp.causaPenal,
      horasSentencia: exp.horasSentencia,
      nombreCoordinador: coordinador?.nombre ?? '—',
      fechaInicio: formatDate(f3.fechaInicioEstimada),
      fechaTermino: formatDate(f3.fechaTerminoEstimada),
      diasAsignados: f3.diasAsignados ?? '—',
      metasPrograma: f3.metasPrograma,
      actividadesPlan: f3.actividadesPlan,
      proyectoVida: f3.proyectoVidaF3,
      observaciones: f3.observacionesPlan,
      tituloDocumento: 'F3 — PLAN DE TRABAJO INDIVIDUAL',
      ...extras,
    };

    return this.generarPdf('f3_plan_trabajo', datos);
  }

  /** F4 — Cédula Inicial de Seguimiento */
  async generarF4CedulaInicial(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f4 = await this.f4Repo.findOne({ where: { expedienteId } });

    if (!f4) {
      throw new NotFoundException(
        `No existe un F4 (Cédula Inicial) para el expediente ${expedienteId}`,
      );
    }

    const coordinador = await this.userRepo.findOne({
      where: { id: f4.coordinadorId },
    });

    const datos: Record<string, unknown> = {
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal: exp.causaPenal,
      nombreCoordinador: coordinador?.nombre ?? '—',
      horasACubrir: f4.horasACubrir,
      modalidadFalta: f4.modalidadFalta ?? '—',
      procesoIngreso: f4.procesoIngreso,
      seguimientoActividades: f4.seguimientoActividades,
      tablaSeguimientoDetallado: f4.tablaSeguimientoDetallado,
      proyectoVidaF4: f4.proyectoVidaF4,
      tituloDocumento: 'F4 — CÉDULA INICIAL DE SEGUIMIENTO',
      ...extras,
    };

    return this.generarPdf('f4_cedula_inicial', datos);
  }

  /** Plan de Vida Individualizada (desde F1) */
  async generarPlanVida(
    expedienteId: string,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f1 = await this.f1Repo.findOne({ where: { expedienteId } });

    if (!f1) {
      throw new NotFoundException(
        `No existe un F1 (Entrevista) para el expediente ${expedienteId}`,
      );
    }

    const psicologo = await this.userRepo.findOne({
      where: { id: f1.psicologoId },
    });

    const datos: Record<string, unknown> = {
      nombreBeneficiario: ben.nombre,
      curp: exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      fechaElaboracion: fechaLarga(),
      nombrePsicologo: psicologo?.nombre ?? '—',
      proyectoVida: f1.proyectoVida,
      observaciones: f1.impresionDiagnostica,
      tituloDocumento: 'PLAN DE VIDA INDIVIDUALIZADA',
      ...extras,
    };

    return this.generarPdf('plan_vida', datos);
  }

  /** Lista de Asistencia */
  async generarListaAsistencia(
    datos: Record<string, unknown>,
  ): Promise<Buffer> {
    return this.generarPdf('lista_asistencia', {
      tituloDocumento: 'LISTA DE ASISTENCIA',
      fecha: fechaLarga(),
      ...datos,
    });
  }

  /** Reporte Semanal */
  async generarReporteSemanal(
    datos: Record<string, unknown>,
  ): Promise<Buffer> {
    return this.generarPdf('reporte_semanal', {
      tituloDocumento: 'REPORTE SEMANAL — CONTROL DE ASISTENCIA',
      ...datos,
    });
  }

  // ── Helpers internos ───────────────────────────────────────────────

  private async getExpediente(expedienteId: string): Promise<ExpedienteCivico> {
    const exp = await this.expedienteRepo.findOne({
      where: { idUUID: expedienteId },
    });
    if (!exp) {
      throw new NotFoundException(
        `Expediente ${expedienteId} no encontrado`,
      );
    }
    return exp;
  }

  private async getBeneficiario(beneficiarioId: number): Promise<Beneficiario> {
    const ben = await this.beneficiarioRepo.findOne({
      where: { id: beneficiarioId },
    });
    if (!ben) {
      throw new NotFoundException(
        `Beneficiario ${beneficiarioId} no encontrado`,
      );
    }
    return ben;
  }

  private async calcularHorasCumplidas(expedienteId: string): Promise<number> {
    const result = await this.bitacoraRepo
      .createQueryBuilder('b')
      .select('SUM(b.horasCubiertas)', 'total')
      .where('b.expedienteId = :expedienteId', { expedienteId })
      .andWhere('b.asistencia IN (:...tipos)', {
        tipos: [AsistenciaEnum.PRESENTE, AsistenciaEnum.PRESENTE_PARCIAL],
      })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total ?? '0');
  }
}

/** Calcula edad en años a partir de una fecha de nacimiento */
function calcularEdad(fechaNacimiento: Date | string | null): number {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nac = typeof fechaNacimiento === 'string'
    ? new Date(fechaNacimiento)
    : fechaNacimiento;
  if (isNaN(nac.getTime())) return 0;
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
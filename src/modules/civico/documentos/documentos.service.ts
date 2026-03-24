import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

import { ExpedienteCivico } from '../expedientes/expediente-civico.entity';
import { Beneficiario }     from '../../../shared/beneficiarios/beneficiario.entity';
import { EntrevistaClinica } from '../f1-entrevista/entrevista-clinica.entity';
import { PlanTrabajo }      from '../f3-plan/plan-trabajo.entity';
import { CedulaInicial }    from '../f4-cedula/cedula-inicial';
import { Incidencia }       from '../incidencias/incidencia.entity';
import { BitacoraCivica }   from '../bitacora/bitacora-civica.entity';
import { User }             from '../../../shared/users/entities/user.entity';
import { OficioGenerado }   from '../oficios/oficio-generado.entity';
import { AsistenciaEnum, TipoDocumentoEnum } from '../enums/civico.enums';

// Resuelve la carpeta raíz del módulo de documentos.
// Prueba __dirname (dist/ tras nest build) y cae a src/ como respaldo.
function resolveDocumentosRoot(): string {
  if (fs.existsSync(path.join(__dirname, 'templates'))) return __dirname;
  const srcRoot = path.join(process.cwd(), 'src', 'modules', 'civico', 'documentos');
  if (fs.existsSync(path.join(srcRoot, 'templates'))) return srcRoot;
  return __dirname;
}

// Convierte un archivo de imagen a data URI base64 para embeber en el HTML.
function toDataUri(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

// Formatea una fecha a dd/mm/yyyy.
function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// Devuelve la fecha actual en formato largo español (ej: "24 de marzo de 2026").
function fechaLarga(): string {
  return new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

// Calcula la edad en años a partir de una fecha de nacimiento.
function calcularEdad(fechaNacimiento: Date | string | null): number {
  if (!fechaNacimiento) return 0;
  const nac = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
  if (isNaN(nac.getTime())) return 0;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

@Injectable()
export class DocumentosService implements OnModuleInit, OnModuleDestroy {
  private logoEncabezado!: string;
  private marcaAgua!: string;
  private browser!: puppeteer.Browser;

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

    @InjectRepository(OficioGenerado)
    private readonly oficioRepo: Repository<OficioGenerado>,
  ) {}

  async onModuleInit(): Promise<void> {
    const docRoot = resolveDocumentosRoot();

    // Cargar logos como data URI (sin error si no existen en el entorno)
    const assetsDir = path.join(docRoot, 'assets');
    const logoPath = path.normalize(path.join(assetsDir, 'logoencabezado_con_margen_derecho(junto 1 sola imagen).png'));
    const marcaPath = path.normalize(path.join(assetsDir, 'LOGO_RECONECTACONLAPAZ_MARCADE AGUA FONDO EN TODOS LOS ARCHIVOS.jpg'));
    this.logoEncabezado = fs.existsSync(logoPath) ? toDataUri(logoPath) : '';
    this.marcaAgua      = fs.existsSync(marcaPath) ? toDataUri(marcaPath) : '';

    // Registrar partials HBS (_header, _footer, _watermark, etc.)
    const partialsDir = path.join(docRoot, 'partials');
    if (fs.existsSync(partialsDir)) {
      for (const file of fs.readdirSync(partialsDir)) {
        if (file.endsWith('.hbs')) {
          const name = path.basename(file, '.hbs');
          Handlebars.registerPartial(name, fs.readFileSync(path.join(partialsDir, file), 'utf-8'));
        }
      }
    }

    // Helpers de Handlebars
    if (!Handlebars.helpers['formatDate']) {
      Handlebars.registerHelper('formatDate', (v: unknown) => formatDate(v as Date | string | null));
    }
    if (!Handlebars.helpers['add']) {
      Handlebars.registerHelper('add', (a: number, b: number) => a + b);
    }
    if (!Handlebars.helpers['eq']) {
      Handlebars.registerHelper('eq', function (this: unknown, a: unknown, b: unknown, opts: Handlebars.HelperOptions) {
        return a === b ? opts.fn(this) : opts.inverse(this);
      });
    }
    if (!Handlebars.helpers['times']) {
      Handlebars.registerHelper('times', function (this: unknown, n: number, opts: Handlebars.HelperOptions) {
        let out = '';
        for (let i = 0; i < n; i++) out += opts.fn(this);
        return out;
      });
    }

    // Lanzar el browser una sola vez; cada petición abre/cierra solo una pestaña
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.browser?.close();
  }

  // Datos que se mezclan en todos los templates (logos, ciudad, firma).
  private baseContext(): Record<string, string> {
    return {
      logoEncabezado: this.logoEncabezado,
      marcaAgua:      this.marcaAgua,
      ciudad:         'Oaxaca de Juárez, Oaxaca',
      firmaNombre:    'LIC. NOMBRE DEL TITULAR',
      firmaCargo:     'Coordinador del Programa Reconecta con la Paz',
    };
  }

  // Método central: compila el template HBS y genera el PDF en Buffer.
  async generarPdf(tipoDocumento: string, datos: Record<string, unknown>): Promise<Buffer> {
    const rutaTemplate = path.join(resolveDocumentosRoot(), 'templates', `${tipoDocumento}.hbs`);

    if (!fs.existsSync(rutaTemplate)) {
      throw new InternalServerErrorException(`Template no encontrado: ${tipoDocumento}.hbs`);
    }

    const html = Handlebars.compile(fs.readFileSync(rutaTemplate, 'utf-8'))({
      ...this.baseContext(),
      ...datos,
    });

    // Reusamos el browser ya lanzado; solo abrimos/cerramos una pestaña por petición
    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  // Guarda el registro del oficio en civic_oficios_generados.
  // Si el folio ya existe (re-generación), simplemente lo omite sin lanzar error.
  private async registrarOficio(params: {
    expedienteId: string;
    generadoPorId: number;
    tipoDocumento: TipoDocumentoEnum;
    folioOficio: string;
    urlArchivo: string;
    nombreArchivoFederal?: string;
  }): Promise<void> {
    const existe = await this.oficioRepo.findOne({ where: { folioOficio: params.folioOficio } });
    if (!existe) {
      await this.oficioRepo.save(this.oficioRepo.create(params));
    }
  }

  // ── Métodos específicos por tipo de documento ──────────────────────

  async generarOficioIncorporacion(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const folio = String(extras['folioOficio'] ?? `OFC-INCORP-${Date.now()}`);

    const buffer = await this.generarPdf('oficio_incorporacion', {
      folioOficio:        folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      delitoImputado:     exp.delitoImputado ?? '—',
      horasSentencia:     exp.horasSentencia,
      folioIncorporacion: exp.folioIncorporacion,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezControl:        exp.juezControl ?? '—',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargo:          'Juez Cívico',
      oficioCanalizacion: exp.oficioCanalizacion ?? '—',
      modalidadFalta:     exp.modalidadFalta ?? '—',
      tituloDocumento:    'OFICIO DE INCORPORACIÓN AL PROGRAMA',
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.OFICIO_INCORPORACION,
      folioOficio:          folio,
      urlArchivo:           `/civico/documentos/oficio-incorporacion/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_OFICIO_INCORPORACION.pdf`,
    });

    return buffer;
  }

  async generarOficioConclusion(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    const folio = String(extras['folioOficio'] ?? `OFC-CONCL-${Date.now()}`);

    const buffer = await this.generarPdf('oficio_conclusion', {
      folioOficio:        folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      folioIncorporacion: exp.folioIncorporacion,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      fechaInicio:        formatDate(ben.fechaIngreso),
      fechaConclusion:    fechaLarga(),
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargo:          'Juez Cívico',
      tituloDocumento:    'OFICIO DE CONCLUSIÓN DEL PROGRAMA',
      actividades:        extras['actividades'] ?? [],
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.OFICIO_CONCLUSION,
      folioOficio:          folio,
      urlArchivo:           `/civico/documentos/oficio-conclusion/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_OFICIO_CONCLUSION.pdf`,
    });

    return buffer;
  }

  async generarInformeBaja(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    const folio = String(extras['folioOficio'] ?? `OFC-BAJA-${Date.now()}`);

    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const buffer = await this.generarPdf('oficio_baja_definitiva', {
      folioOficio:        folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      folioIncorporacion: exp.folioIncorporacion,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      fechaBaja:          fechaLarga(),
      motivoBaja:         exp.estatusProceso,
      totalIncidencias:   incidencias.length,
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargo:          'Juez Cívico',
      tituloDocumento:    'INFORME DE BAJA DEFINITIVA',
      incidencias: incidencias.map((i) => ({
        tipo:                  i.tipo,
        fechaFormateada:       formatDate(i.fechaIncidencia),
        descripcionHechos:     i.descripcionHechos,
        esAcumulativa:         i.esAcumulativa,
        estatusResolucion:     i.estatusResolucion,
        numOficioNotificacion: i.numOficioNotificacion ?? '—',
      })),
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.OFICIO_BAJA_DEFINITIVA,
      folioOficio:          folio,
      urlArchivo:           `/civico/documentos/informe-baja/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_OFICIO_BAJA_DEFINITIVA.pdf`,
    });

    return buffer;
  }

  async generarHojaPresentacion(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const contactos = exp.contactosFamiliares as Record<string, { nombre: string; telefono: string }> | null;

    const buffer = await this.generarPdf('hoja_presentacion', {
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      fechaNacimiento:    formatDate(exp.fechaNacimiento),
      edad:               calcularEdad(exp.fechaNacimiento),
      genero:             exp.genero ?? '—',
      estadoCivil:        exp.estadoCivil ?? '—',
      domicilio:          exp.domicilioCompleto,
      municipio:          exp.municipio ?? '—',
      telefono:           exp.telefonoContacto ?? '—',
      escolaridad:        exp.escolaridadActual ?? '—',
      ocupacion:          exp.ocupacionActual ?? '—',
      lenguaIndigena:     exp.lenguaIndigena,
      religion:           exp.religion,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal:         exp.causaPenal,
      juzgadoNombre:      exp.numJuzgadoCivico ?? '—',
      juezControl:        exp.juezControl ?? '—',
      delitoImputado:     exp.delitoImputado ?? '—',
      modalidadFalta:     exp.modalidadFalta ?? '—',
      oficioCanalizacion: exp.oficioCanalizacion ?? '—',
      horasSentencia:     exp.horasSentencia,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      contactoPadre:      contactos?.['padre'],
      contactoMadre:      contactos?.['madre'],
      contactoTutor:      contactos?.['tutor'],
      tituloDocumento:    'HOJA DE PRESENTACIÓN AL PROGRAMA',
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.HOJA_PRESENTACION,
      folioOficio:          `HOJA-PRES-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/hoja-presentacion/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_HOJA_PRESENTACION.pdf`,
    });

    return buffer;
  }

  async generarFichaIncidencias(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const buffer = await this.generarPdf('ficha_incidencias', {
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal:         exp.causaPenal,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      estatusProceso:     exp.estatusProceso,
      fechaGeneracion:    fechaLarga(),
      totalStrikes:       incidencias.filter((i) => i.esAcumulativa).length,
      totalIncidencias:   incidencias.length,
      tituloDocumento:    'FICHA TÉCNICA DE INCIDENCIAS',
      incidencias: incidencias.map((i) => ({
        tipo:                  i.tipo,
        fechaFormateada:       formatDate(i.fechaIncidencia),
        descripcionHechos:     i.descripcionHechos,
        esAcumulativa:         i.esAcumulativa,
        estatusResolucion:     i.estatusResolucion,
        numOficioNotificacion: i.numOficioNotificacion ?? '—',
      })),
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.INFORME_INCIDENCIAS,
      folioOficio:          `FICHA-INC-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/ficha-incidencias/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_FICHA_INCIDENCIAS.pdf`,
    });

    return buffer;
  }

  async generarF3PlanTrabajo(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f3  = await this.f3Repo.findOne({ where: { expedienteId } });
    if (!f3) throw new NotFoundException(`No existe un F3 (Plan de Trabajo) para el expediente ${expedienteId}`);

    const coordinador = await this.userRepo.findOne({ where: { id: f3.coordinadorId } });

    const buffer = await this.generarPdf('f3_plan_trabajo', {
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      causaPenal:         exp.causaPenal,
      horasSentencia:     exp.horasSentencia,
      nombreCoordinador:  coordinador?.nombre ?? '—',
      fechaInicio:        formatDate(f3.fechaInicioEstimada),
      fechaTermino:       formatDate(f3.fechaTerminoEstimada),
      diasAsignados:      f3.diasAsignados ?? '—',
      metasPrograma:      f3.metasPrograma,
      actividadesPlan:    f3.actividadesPlan,
      proyectoVida:       f3.proyectoVidaF3,
      observaciones:      f3.observacionesPlan,
      tituloDocumento:    'F3 — PLAN DE TRABAJO INDIVIDUAL',
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.F3_PLAN_TRABAJO,
      folioOficio:          `F3-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/f3-plan-trabajo/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_F3_PLAN_TRABAJO.pdf`,
    });

    return buffer;
  }

  async generarF4CedulaInicial(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f4  = await this.f4Repo.findOne({ where: { expedienteId } });
    if (!f4) throw new NotFoundException(`No existe un F4 (Cédula Inicial) para el expediente ${expedienteId}`);

    const coordinador = await this.userRepo.findOne({ where: { id: f4.coordinadorId } });

    const buffer = await this.generarPdf('f4_cedula_inicial', {
      nombreBeneficiario:          ben.nombre,
      curp:                        exp.curp,
      folioIncorporacion:          exp.folioIncorporacion,
      causaPenal:                  exp.causaPenal,
      nombreCoordinador:           coordinador?.nombre ?? '—',
      horasACubrir:                f4.horasACubrir,
      modalidadFalta:              f4.modalidadFalta ?? '—',
      procesoIngreso:              f4.procesoIngreso,
      seguimientoActividades:      f4.seguimientoActividades,
      tablaSeguimientoDetallado:   f4.tablaSeguimientoDetallado,
      proyectoVidaF4:              f4.proyectoVidaF4,
      tituloDocumento:             'F4 — CÉDULA INICIAL DE SEGUIMIENTO',
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.F4_CEDULA_INICIAL,
      folioOficio:          `F4-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/f4-cedula-inicial/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_F4_CEDULA_INICIAL.pdf`,
    });

    return buffer;
  }

  async generarPlanVida(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f1  = await this.f1Repo.findOne({ where: { expedienteId } });
    if (!f1) throw new NotFoundException(`No existe un F1 (Entrevista) para el expediente ${expedienteId}`);

    const psicologo = await this.userRepo.findOne({ where: { id: f1.psicologoId } });

    const buffer = await this.generarPdf('plan_vida', {
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      folioIncorporacion: exp.folioIncorporacion,
      fechaElaboracion:   fechaLarga(),
      nombrePsicologo:    psicologo?.nombre ?? '—',
      proyectoVida:       f1.proyectoVida,
      observaciones:      f1.impresionDiagnostica,
      tituloDocumento:    'PLAN DE VIDA INDIVIDUALIZADA',
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.PLAN_VIDA,
      folioOficio:          `PLAN-VIDA-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/plan-vida/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_PLAN_VIDA.pdf`,
    });

    return buffer;
  }

  // Lista de asistencia y reporte semanal son ad-hoc (sin expedienteId),
  // así que no se registran en el historial de oficios.
  async generarListaAsistencia(datos: Record<string, unknown>): Promise<Buffer> {
    return this.generarPdf('lista_asistencia', {
      tituloDocumento: 'LISTA DE ASISTENCIA',
      fecha: fechaLarga(),
      ...datos,
    });
  }

  async generarReporteSemanal(datos: Record<string, unknown>): Promise<Buffer> {
    return this.generarPdf('reporte_semanal', {
      tituloDocumento: 'REPORTE SEMANAL — CONTROL DE ASISTENCIA',
      ...datos,
    });
  }

  // ── Helpers privados ───────────────────────────────────────────────

  private async getExpediente(expedienteId: string): Promise<ExpedienteCivico> {
    const exp = await this.expedienteRepo.findOne({ where: { idUUID: expedienteId } });
    if (!exp) throw new NotFoundException(`Expediente ${expedienteId} no encontrado`);
    return exp;
  }

  private async getBeneficiario(beneficiarioId: number): Promise<Beneficiario> {
    const ben = await this.beneficiarioRepo.findOne({ where: { id: beneficiarioId } });
    if (!ben) throw new NotFoundException(`Beneficiario ${beneficiarioId} no encontrado`);
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

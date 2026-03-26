import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
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
import { SeguimientoPsicologico } from '../f5-seguimiento/seguimiento-psicologico.entity';
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

// Devuelve la fecha en formato largo español (ej: "22 DE MARZO DEL 2026").
function fechaLargaFormat(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = meses[d.getMonth()];
  const yyyy = d.getFullYear();
  
  return `${dd} DE ${mm} DEL ${yyyy}`;
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

// Convierte una fecha cualquiera a formato largo con día de la semana
// Ej: "domingo 22 de marzo de 2026"
function fechaLargaDesde(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

// Convierte una fecha a formato largo SIN día de la semana
// Ej: "22 de marzo de 2026"
function fechaLargaSinDia(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

// Extrae los días del array diasAsignadosJuzgado y los formatea como texto legible
// Ej: "5 y 12 de abril" a partir de ["2026-04-05","2026-04-12"]
function formatDiasProgramados(dias: string[] | null): string {
  if (!dias || !Array.isArray(dias) || dias.length === 0) return '';
  
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  
  // Parsear manualmente para evitar desfase UTC
  const parsed = dias
    .map(d => {
      const [y, m, dd] = d.split('-').map(Number);
      if (!y || !m || !dd) return null;
      return { dia: dd, mes: m, year: y, mesNombre: meses[m - 1] };
    })
    .filter(x => x !== null)
    .sort((a, b) => (a!.year - b!.year) || (a!.mes - b!.mes) || (a!.dia - b!.dia));
  
  if (parsed.length === 0) return '';
  
  const partes = parsed.map(f => `${f!.dia} de ${f!.mesNombre}`);
  
  if (partes.length === 1) return partes[0];
  return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
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
    private logoEncabezado: string = '';
    private marcaAgua: string = '';
    private logoPresentacion1: string = '';
    private logoPresentacion2: string = '';
    private logoGrecas: string = '';
    private logoEncabezadoSspc: string = '';
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

    @InjectRepository(SeguimientoPsicologico)
    private readonly seguimientoRepo: Repository<SeguimientoPsicologico>,
  ) {}

  async onModuleInit(): Promise<void> {
    const docRoot = resolveDocumentosRoot();

    // Cargar logos como data URI (sin error si no existen en el entorno)
    const assetsDir = path.join(docRoot, 'assets');
    const logoPath = path.normalize(path.join(assetsDir, 'logoencabezado_con_margen_derecho.png'));
    const marcaPath = path.normalize(path.join(assetsDir, 'LOGO_RECONECTACONLAPAZ_MARCADE AGUA FONDO EN TODOS LOS ARCHIVOS.jpg'));
    const logoPres1Path = path.normalize(path.join(assetsDir, 'Logo_encabezado_expediente.jpg'));
    const logoPres2Path = path.normalize(path.join(assetsDir, 'LOGO_RECONECTACONLAPAZ.jpg'));
    const grecasPath = path.normalize(path.join(assetsDir, 'grecas_oaxaca.png'));
    const sspcPath = path.normalize(path.join(assetsDir, 'Logo_EncabezadoSSPC.png'));
    
    this.logoEncabezado     = fs.existsSync(logoPath) ? toDataUri(logoPath) : '';
    this.marcaAgua          = fs.existsSync(marcaPath) ? toDataUri(marcaPath) : '';
    this.logoPresentacion1  = fs.existsSync(logoPres1Path) ? toDataUri(logoPres1Path) : '';
    this.logoPresentacion2  = fs.existsSync(logoPres2Path) ? toDataUri(logoPres2Path) : '';
    this.logoGrecas         = fs.existsSync(grecasPath) ? toDataUri(grecasPath) : '';
    this.logoEncabezadoSspc = fs.existsSync(sspcPath) ? toDataUri(sspcPath) : '';

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
        if (opts && typeof opts.fn === 'function') {
          return a === b ? opts.fn(this) : opts.inverse(this);
        }
        return a === b;
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

  // Datos que se mezclan en todos los templates (logos, ciudad, firma, CC).
  // Ajustar estos valores cuando cambie el titular o las autoridades firmantes.
  private baseContext(): Record<string, string> {
    return {
      logoEncabezado:     this.logoEncabezado,
      marcaAgua:          this.marcaAgua,
      logoPresentacion1:  this.logoPresentacion1,
      logoPresentacion2:  this.logoPresentacion2,
      ciudad:             'Oaxaca de Juárez, Oaxaca',
      // Firma del titular — actualizar cuando cambie el cargo
      firmaNombre:        'MTRA. LII YIO PÉREZ ZÁRATE',
      firmaCargo1:        'DIRECTORA GENERAL DE PREVENCIÓN DEL DELITO',
      firmaCargo2:        'Y PARTICIPACIÓN CIUDADANA',
      firmaIniciales:     'LYPZ/gujl',
      // CC estándar para oficios
      ccSecretario:       'Almirante I.Mp Dem. Ret. Félix Quiroz Javier, Secretario de Seguridad y Protección Ciudadana del Estado de Oaxaca',
      ccSubsecretario:    'Dr. Roberto Claudio Castillo Rámirez, Subsecretario de Prevención y Reinserción Social',
      // Coordinador del programa — para contacto en el cuerpo de los oficios
      coordinadorNombre:  'Lic. Gandhi Ulises Juárez López, Coordinador del programa "Reconecta con la Paz"',
      coordinadorTelefono:'951 224 1899',
      coordinadorEmail:   'dgp.dypc@sspo.gob.mx',
    };
  }

  // Método central: compila el template HBS y genera el PDF en Buffer.
  async generarPdf(tipoDocumento: string, datos: Record<string, unknown>): Promise<Buffer> {
    // Busca el template primero en dist/ (producción) y luego en src/ (respaldo para dev
    // o cuando dist/ tiene el directorio templates/ pero le faltan archivos recién añadidos).
    const distPath = path.join(__dirname, 'templates', `${tipoDocumento}.hbs`);
    const srcPath  = path.join(
      process.cwd(), 'src', 'modules', 'civico', 'documentos',
      'templates', `${tipoDocumento}.hbs`,
    );
    const rutaTemplate = fs.existsSync(distPath) ? distPath
                       : fs.existsSync(srcPath)  ? srcPath
                       : null;

    if (!rutaTemplate) {
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

  // Busca si el expediente ya tiene un folio asignado para ese tipo de documento.
  private async buscarFolioExistente(
    expedienteId: string,
    tipoDocumento: TipoDocumentoEnum,
  ): Promise<string | null> {
    const oficio = await this.oficioRepo.findOne({
      where: { expedienteId, tipoDocumento },
      order: { fechaGeneracion: 'DESC' },
    });
    return oficio ? oficio.folioOficio : null;
  }

  // Genera el folio consecutivo SSyPC/SPRS/DGPDyPC/0000/YYYY
  private async obtenerFolioConsecutivo(extras: Record<string, unknown>): Promise<string> {
    if (extras['folioOficio']) return String(extras['folioOficio']);

    const year = new Date().getFullYear();
    const prefix = `SSyPC/SPRS/DGPDyPC/`;
    const suffix = `/${year}`;

    // Buscar el último folio del año actual
    const lastOficio = await this.oficioRepo
      .createQueryBuilder('o')
      .where('o.folioOficio LIKE :pattern', { pattern: `${prefix}%${suffix}` })
      .orderBy('o.fechaGeneracion', 'DESC')
      .getOne();

    let nextNum = 20;
    if (lastOficio) {
      const parts = lastOficio.folioOficio.split('/');
      // SSyPC / SPRS / DGPDyPC / 0045 / 2026
      if (parts.length >= 5) {
        const numStr = parts[parts.length - 2];
        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed)) {
          nextNum = parsed + 1;
        }
      }
    }

    const numPadded = String(nextNum).padStart(4, '0');
    return `${prefix}${numPadded}${suffix}`;
  }

  // ── Métodos específicos por tipo de documento ──────────────────────

  async generarOficioIncorporacion(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    
    // Re-uso de folio si ya existe
    const folioExistente = await this.buscarFolioExistente(expedienteId, TipoDocumentoEnum.OFICIO_INCORPORACION);
    const folio = folioExistente ?? (await this.obtenerFolioConsecutivo(extras));

    // Determinar género del juez para el template
    const esJuezFemenino = (exp.generoJuez ?? '').toUpperCase() === 'F';

    const buffer = await this.generarPdf('oficio_incorporacion', {
      numOficio:          folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      delitoImputado:     exp.delitoImputado ?? '—',
      horasSentencia:     exp.horasSentencia,
      folioExpediente: exp.folioExpediente,
      // Fecha de incorporación en formato largo con día de semana
      fechaIncorporacion: fechaLargaDesde(exp.fechaInicioBeneficio ?? ben.fechaIngreso),
      // Fecha de conclusión del beneficio
      fechaConclusion:    fechaLargaSinDia(exp.fechaTerminoBeneficio),
      // Fecha del oficio de canalización
      fechaCanalizacion:  fechaLargaSinDia(exp.fechaOficioCanalizacion),
      // Días programados de tequios
      diasProgramados:    formatDiasProgramados(exp.diasAsignadosJuzgado),
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargoCompleto:  'Juez Cívico Municipal Especializado en Faltas Administrativas para la Buena Convivencia Comunitaria',
      oficioCanalizacion: exp.numJuzgadoCivico ? `ExFac. ${exp.numJuzgadoCivico}` : (exp.oficioCanalizacion ?? '—'),
      modalidadFalta:     exp.modalidadFalta ?? '—',
      esJuezFemenino,
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
    
    // Re-uso de folio
    const folioExistente = await this.buscarFolioExistente(expedienteId, TipoDocumentoEnum.OFICIO_CONCLUSION);
    const folio = folioExistente ?? (await this.obtenerFolioConsecutivo(extras));
    const esJuezFemenino = (exp.generoJuez ?? '').toUpperCase() === 'F';

    // Traer actividades realizadas desde la bitácora (con nombre de actividad)
    const bitacoraRows = await this.bitacoraRepo
      .createQueryBuilder('b')
      .leftJoin('actividades', 'a', 'a.id = b.actividad_id')
      .select(['b.fecha_actividad AS fecha', 'a.nombre AS nombre', 'b.observaciones AS observaciones'])
      .where('b.expediente_id = :expedienteId', { expedienteId })
      .andWhere('b.asistencia IN (:...tipos)', {
        tipos: [AsistenciaEnum.PRESENTE, AsistenciaEnum.PRESENTE_PARCIAL],
      })
      .orderBy('b.fecha_actividad', 'ASC')
      .getRawMany<{ fecha: string; nombre: string | null; observaciones: string | null }>();

    const actividades = bitacoraRows.map(r => {
      let desc = (r.nombre ?? r.observaciones ?? 'actividad del programa').trim();
      const lowerDesc = desc.toLowerCase();
      
      const verbosAccion = [
        'participó', 'participo', 'impartió', 'impartio', 'asistió', 'asistio', 
        'realizó', 'realizo', 'apoyó', 'apoyo', 'colaboró', 'colaboro', 'coordinó', 'coordino'
      ];
      const tieneVerbo = verbosAccion.some(v => lowerDesc.startsWith(v));
      
      if (!tieneVerbo) {
        desc = `Participó en ${desc.charAt(0).toLowerCase() + desc.slice(1)}`;
      }

      let strFecha = fechaLargaDesde(r.fecha);
      if (strFecha.startsWith('el ')) {
        strFecha = strFecha.substring(3); // Removemos 'el ' para que no se duplique en el template
      }

      return {
        descripcion: desc,
        fecha: strFecha,
      };
    });

    const buffer = await this.generarPdf('oficio_conclusion', {
      numOficio:          folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      folioExpediente: exp.folioExpediente,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      fechaInicio:        fechaLargaSinDia(ben.fechaIngreso),
      fechaConclusion:    fechaLarga(),
      fechaCanalizacion:  fechaLargaSinDia(exp.fechaOficioCanalizacion),
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargoCompleto:  'Juez Cívico Municipal Especializado en Faltas Administrativas para la Buena Convivencia Comunitaria',
      oficioCanalizacion: exp.numJuzgadoCivico ? `ExFac. ${exp.numJuzgadoCivico}` : (exp.oficioCanalizacion ?? exp.causaPenal),
      actividades,
      esJuezFemenino,
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
    
    // Re-uso de folio
    const folioExistente = await this.buscarFolioExistente(expedienteId, TipoDocumentoEnum.OFICIO_BAJA_DEFINITIVA);
    const folio = folioExistente ?? (await this.obtenerFolioConsecutivo(extras));

    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const buffer = await this.generarPdf('oficio_baja_definitiva', {
      numOficio:          folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      folioExpediente: exp.folioExpediente,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      fechaIncorporacion: formatDate(ben.fechaIngreso),
      fechaBaja:          fechaLarga(),
      motivoBaja:         exp.estatusProceso,
      totalIncidencias:   incidencias.length,
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargoCompleto:  'Juez Cívico Municipal Especializado en Faltas Administrativas para la Buena Convivencia Comunitaria',
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

  async generarFichaIncidencias(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    
    // Re-uso de folio
    const folioExistente = await this.buscarFolioExistente(expedienteId, TipoDocumentoEnum.INFORME_INCIDENCIAS);
    const folio = folioExistente ?? (await this.obtenerFolioConsecutivo(extras));
    
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const buffer = await this.generarPdf('ficha_incidencias', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      folioExpediente: exp.folioExpediente,
      causaPenal:         exp.causaPenal,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      estatusProceso:     exp.estatusProceso,
      fechaGeneracion:    fechaLargaSinDia(new Date()),
      totalStrikes:       incidencias.filter((i) => i.esAcumulativa).length,
      totalIncidencias:   incidencias.length,
      paginarTabla:       incidencias.length > 2,
      incidencias: incidencias.map((i) => {
        let ft = fechaLargaDesde(i.fechaIncidencia);
        ft = ft.charAt(0).toUpperCase() + ft.slice(1); // "El martes, 7 de abril de 2026"
        return {
          tipo:                  i.tipo,
          fechaFormateada:       formatDate(i.fechaIncidencia),
          fechaLarga:            ft,
          descripcionHechos:     i.descripcionHechos,
          esAcumulativa:         i.esAcumulativa,
          estatusResolucion:     i.estatusResolucion,
          numOficioNotificacion: i.numOficioNotificacion ?? '—',
        };
      }),
      ...extras,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.INFORME_INCIDENCIAS,
      folioOficio:          folio,
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

    // Re-uso de folio
    const folioExistente = await this.buscarFolioExistente(expedienteId, TipoDocumentoEnum.F3_PLAN_TRABAJO);
    const folio = folioExistente ?? `F3-${expedienteId.slice(0, 8).toUpperCase()}`;

    const buffer = await this.generarPdf('f3_plan_trabajo', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre,
      curp:               exp.curp,
      folioExpediente: exp.folioExpediente,
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
      folioOficio:          folio,
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
    
    // F4 Data
    const f4  = await this.f4Repo.findOne({ where: { expedienteId } });
    if (!f4) throw new NotFoundException(`No existe un F4 (Cédula Inicial) para el expediente ${expedienteId}`);

    // La Ficha 4 hereda los planes e intenciones documentados en F3
    const f3  = await this.f3Repo.findOne({ where: { expedienteId } });
    
    // Calculamos edad
    const fn = new Date(exp.fechaNacimiento);
    const ageDiffMs = Date.now() - fn.getTime();
    const ageDate = new Date(ageDiffMs);
    const edad = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Re-uso de folio
    const folioExistente = await this.buscarFolioExistente(expedienteId, TipoDocumentoEnum.F4_CEDULA_INICIAL);
    const folio = folioExistente ?? (await this.obtenerFolioConsecutivo({ ...extras, tipoFirma: 'F4' }));

    // Armamos el payload completo
    const buffer = await this.generarPdf('f4_cedula_inicial', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre,
      edad:               edad,
      curp:               exp.curp,
      estadoCivil:        exp.estadoCivil ?? '—',
      domicilioCompleto:  exp.domicilioCompleto,
      codigoPostal:       exp.codigoPostal ?? '—',
      municipio:          exp.municipio ?? '—',
      ocupacionActual:    exp.ocupacionActual ?? '—',
      fechaIngreso:       formatDate(ben.fechaIngreso),
      telefonoContacto:   exp.telefonoContacto ?? '—',
      fotoBeneficiario:   await (async () => {
        const ruta = ben.urlFoto?.trim();
        if (!ruta) return null;
        if (ruta.startsWith('http')) return ruta;
        return fs.existsSync(ruta) ? toDataUri(ruta) : null;
      })(),
      
      causaPenal:         exp.causaPenal,
      delitoImputado:     exp.delitoImputado ?? '—',
      modalidadFalta:     exp.modalidadFalta ?? '—',
      agraviado:          exp.agraviado ?? '—',
      horasSentencia:     exp.horasSentencia,

      // Info heredada de la F3
      proyectoVida:       f3?.proyectoVidaF3 ?? {},
      metasPrograma:      f3?.metasPrograma ?? '',
      actividadesPlan:    f3?.actividadesPlan ?? {},
      observacionesPlan:  f3?.observacionesPlan ?? '',

      // Mapeo F4 Nativo
      procesoIngreso:         f4.procesoIngreso ?? '—',
      seguimientoActividades: f4.seguimientoActividades ?? {},

      tituloDocumento:    'FICHA TECNICA DE SEGUIMIENTO',
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

    const f1 = await this.f1Repo.findOne({ where: { expedienteId } });
    const f3 = await this.f3Repo.findOne({ where: { expedienteId } });
    const psicologo = await this.userRepo.findOne({ where: { id: f1?.psicologoId } });

    // 1. Obtener Guía Asignado desde la Bitácora (si existe algún registro)
    const primerBitacora = await this.bitacoraRepo.findOne({
      where: { expedienteId },
      order: { createdAt: 'ASC' },
      relations: ['guia']
    });
    const nombreGuiaBitacora = primerBitacora?.guia?.nombre?.toUpperCase();

    // 2. Obtener Evidencias de Bitácora (Galería de fotos)
    const registrosBitacora = await this.bitacoraRepo.find({
      where: { expedienteId, evidenciaUrl: Not(IsNull()) },
      order: { fechaActividad: 'ASC' }
    });

    const evidencias = registrosBitacora.map(reg => {
      const ruta = reg.evidenciaUrl?.trim();
      let dataUri = null;
      if (ruta) {
        if (ruta.startsWith('http')) {
          dataUri = ruta;
        } else if (fs.existsSync(ruta)) {
          dataUri = toDataUri(ruta);
        }
      }
      return {
        fecha: formatDate(reg.fechaActividad),
        actividad: reg.detalleIncidencia || reg.observaciones || 'Actividad sin detalle',
        url: dataUri
      };
    }).filter(e => e.url !== null);

    // 2. Mapeo de Ejes (7 categorías del F5 vs 8 del F3)
    // El frontend mandará el mapeo o lo extraemos del extras.
    // Si no viene, usamos un esqueleto básico.
    const ejesDefault = [
      { eje: 'SALUD', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
      { eje: 'CAPACITACIÓN PARA EL TRABAJO', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
      { eje: 'TRABAJO', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
      { eje: 'DEPORTE', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
      { eje: 'CULTURA', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
      { eje: 'EDUCACIÓN', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
      { eje: 'SERVICIO SOCIAL A FAVOR DEL ESTADO', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' }
    ];

    const buffer = await this.generarPdf('plan_vida', {
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      folioExpediente:    exp.folioExpediente,
      fechaIngreso:       fechaLargaFormat(ben.fechaIngreso),
      nombreGuia:         extras['nombreGuia'] ?? nombreGuiaBitacora ?? psicologo?.nombre?.toUpperCase() ?? '—',
      fechaTemporalidad:  fechaLargaFormat(exp.fechaTerminoBeneficio || (f3 as any)?.fechaTerminoEstimada),
      
      // Logos e Imágenes (ya inicializados en onModuleInit)
      logoEncabezado:    this.logoEncabezadoSspc,
      logoGrecas:        this.logoGrecas,
      
      ejes:               extras['ejes'] ?? ejesDefault,
      evidencias:         evidencias,
      
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
      logoPresentacion1: this.logoPresentacion1,
      logoPresentacion2: this.logoPresentacion2,
      tituloDocumento: 'LISTA DE ASISTENCIA',
      fecha: fechaLarga(),
      ...datos,
    });
  }

  // Genera la lista de asistencia (hoja de presentación) pre-llenada para un beneficiario.
  async generarListaAsistenciaBeneficiario(
    expedienteId: string,
    userId: number,
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    // Buscamos si hay un guía asignado en bitácora para pre-llenar la firma
    const primerBitacora = await this.bitacoraRepo.findOne({
      where: { expedienteId },
      order: { createdAt: 'ASC' },
      relations: ['guia']
    });

    const buffer = await this.generarPdf('lista_asistencia', {
      logoPresentacion1:  this.logoPresentacion1,
      logoPresentacion2:  this.logoPresentacion2,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      nombreGuia:         primerBitacora?.guia?.nombre?.toUpperCase() || '—',
      fecha:              '', // Se deja vacío para el usuario
      observaciones:      '',
      actividades:        [],
      filasVacias:        2,
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.LISTA_ASISTENCIA,
      folioOficio:          `PRES-SOCIAL-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/lista-asistencia/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_PRESENTACION_SOCIAL.pdf`,
    });

    return buffer;
  }

  async generarReporteSemanal(datos: Record<string, unknown>): Promise<Buffer> {
    return this.generarPdf('reporte_semanal', {
      logoEncabezadoSspc: this.logoEncabezadoSspc,
      logoGrecas:         this.logoGrecas,
      ...datos,
    });
  }

  // Genera el reporte semanal pre-llenado para un beneficiario.
  async generarReporteSemanalBeneficiario(
    expedienteId: string,
    userId: number,
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    const primerBitacora = await this.bitacoraRepo.findOne({
      where: { expedienteId },
      order: { createdAt: 'ASC' },
      relations: ['guia']
    });

    const buffer = await this.generarPdf('reporte_semanal', {
      logoEncabezadoSspc: this.logoEncabezadoSspc,
      logoGrecas:         this.logoGrecas,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      nombreGuia:         primerBitacora?.guia?.nombre?.toUpperCase() || '—',
      fecha:              fechaLarga(),
      fechaPeriodo:       '', 
      observaciones:      '',
      actividades:        [],
    });

    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.REPORTE_SEMANAL_GUIA,
      folioOficio:          `REP-SEM-${expedienteId}-${Date.now()}`,
      urlArchivo:           `/civico/documentos/reporte-semanal/${expedienteId}`,
      nombreArchivoFederal: `${exp.curp}_REPORTE_SEMANAL.pdf`,
    });

    return buffer;
  }

  // ── Helpers privados ───────────────────────────────────────────────

  async generarNotaEvolucion(
    expedienteId: string,
    userId: number,
  ): Promise<Buffer> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    // Todas las sesiones ordenadas por número de sesión
    const sesionesRepo = await this.seguimientoRepo.find({
      where: { expedienteId },
      order: { numSesion: 'ASC' },
      relations: ['psicologo'],
    });

    const sesiones = sesionesRepo.map((s) => ({
      numSesion: s.numSesion,
      fecha: formatDate(s.fechaSesion),
      hora: s.horaSesion || '—',
      objetivo: s.objetivoSesion || '—',
      conducta: s.conductaDisposicion || '—',
      resumen: s.descripcionIntervencion || '—',
      tema: s.temaSesion || '—',
      estrategia: s.estrategiaAplicada || '—',
      plan: s.planTerapeutico || '—',
      actividades: s.actividadesAsignadasUsuario || '—',
      observaciones: s.observaciones || '—',
      fechaProxima: formatDate(s.fechaProximaSesion),
      nombrePsicologo: s.psicologo?.nombre?.toUpperCase() || '—',
      // Usar cédula profesional guardada en la sesión, fallback a placeholder
      cedulaPsicologo: s.cedulaProfesional || '6487612',
    }));

    const buffer = await this.generarPdf('nota_evolucion', {
      nombreUsuario: ben.nombre.toUpperCase(),
      edad: calcularEdad(exp.fechaNacimiento),
      sexo: (exp.genero || '—').charAt(0).toUpperCase(),
      folioExpediente: exp.folioExpediente,
      sesiones,

      // Branding oficial (mismo que oficios de incorporación/conclusión)
      logoEncabezado:    this.logoEncabezado,
    });

    return buffer;
  }

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

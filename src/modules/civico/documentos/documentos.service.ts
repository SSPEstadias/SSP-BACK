import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, Like } from 'typeorm';
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
import { EstudioSocioeconomico } from '../f2-estudio/estudio-socioeconomico.entity';
import { Actividad }        from '../../../shared/actividades/actividad.entity';
import { AsistenciaEnum, TipoDocumentoEnum, FormStatusEnum } from '../enums/civico.enums';
import { CivicoGoogleDriveService } from '../../../shared/google-drive/civico-google-drive.service';

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
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [yyyy, mm, dd] = value.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

// Devuelve la fecha en formato largo español (ej: "22 DE MARZO DEL 2026").
function fechaLargaFormat(value: Date | string | null | undefined): string {
  if (!value) return '—';

  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [yyyy, mm, dd] = value.split('-');
    return `${dd} DE ${meses[parseInt(mm, 10) - 1]} DEL ${yyyy}`;
  }

  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);

  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = meses[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();

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
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    value = new Date(y, m - 1, d);
  }
  const d = typeof value === 'string' ? new Date(value) : value as Date;
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
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    value = new Date(y, m - 1, d);
  }
  const d = typeof value === 'string' ? new Date(value) : value as Date;
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
    private readonly logger = new Logger(DocumentosService.name);
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

    @InjectRepository(EstudioSocioeconomico)
    private readonly f2Repo: Repository<EstudioSocioeconomico>,

    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,

    private readonly driveService: CivicoGoogleDriveService,
  ) {}

  async onModuleInit(): Promise<void> {
    const start = Date.now();
    const docRoot = resolveDocumentosRoot();
    const assetsDir = path.join(docRoot, 'assets');

      this.logger.debug('Cargando recursos gráficos...');
    const logoFiles = [
      { key: 'logoEncabezado',     file: 'logoencabezado_con_margen_derecho.png' },
      { key: 'marcaAgua',          file: 'LOGO_RECONECTACONLAPAZ_MARCADE AGUA FONDO EN TODOS LOS ARCHIVOS.jpg' },
      { key: 'logoPresentacion1',  file: 'Logo_encabezado_expediente.jpg' },
      { key: 'logoPresentacion2',  file: 'LOGO_RECONECTACONLAPAZ.jpg' },
      { key: 'logoGrecas',         file: 'grecas_oaxaca.png' },
      { key: 'logoEncabezadoSspc', file: 'Logo_EncabezadoSSPC.png' },
    ];

    await Promise.all(logoFiles.map(async (item) => {
      const fullPath = path.normalize(path.join(assetsDir, item.file));
      if (fs.existsSync(fullPath)) {
        const buffer = await fs.promises.readFile(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        (this as any)[item.key] = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    }));
    this.logger.debug(`Recursos gráficos cargados en ${Date.now() - start}ms`);

    const partialStart = Date.now();

    // Registrar partials HBS (_header, _footer, _watermark, etc.) en paralelo
    const partialsDir = path.join(docRoot, 'partials');
    if (fs.existsSync(partialsDir)) {
      const partialFiles = fs.readdirSync(partialsDir).filter(f => f.endsWith('.hbs'));
      await Promise.all(partialFiles.map(async (file) => {
        const name = path.basename(file, '.hbs');
        const content = await fs.promises.readFile(path.join(partialsDir, file), 'utf-8');
        Handlebars.registerPartial(name, content);
      }));
    }
    this.logger.debug(`Partials HBS registrados en ${Date.now() - partialStart}ms`);

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

    const browserStart = Date.now();
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.logger.debug(`Puppeteer inicializado en ${Date.now() - browserStart}ms`);
    this.logger.log(`DocumentosService listo (Arranque total: ${Date.now() - start}ms)`);
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


  /**
   * Asegura que exista la carpeta del beneficiario y retorna su ID.
   * Auto-sana si la carpeta fue borrada en Drive.
   */
  async asegurarCarpetaBeneficiario(expedienteId: string): Promise<string> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const folderName = `${ben.nombre.toUpperCase()} - ${exp.folioExpediente}`;

    if (exp.driveFolderId) {
      const meta = await this.driveService.getFileMetadata(exp.driveFolderId);
      if (meta && !meta.trashed) return exp.driveFolderId;
    }

    // Crear de nuevo si no existe o fue borrada
    const folderId = await this.driveService.getOrCreateFolder(folderName);
    exp.driveFolderId = folderId;
    await this.expedienteRepo.save(exp);
    return folderId;
  }

  /**
   * Sube un documento escaneado/firmado a Drive, actualiza el expediente
   * y registra el documento en oficios_generados con esExterno=true.
   */
  async subirDocumentoEscaneado(
    expedienteId: string,
    tipo: 'CANALIZACION' | 'INCORPORACION',
    file: Express.Multer.File,
    userId: number,
  ): Promise<{ driveFileId: string; urlArchivo: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

      const parentId = await this.asegurarCarpetaBeneficiario(expedienteId);
    const signedFolderId = await this.driveService.getSignedDocsFolder(parentId);

      const filename = `${tipo}_FIRMADO - ${ben.nombre.toUpperCase()} - ${exp.folioExpediente}.pdf`;
    const driveData = await this.driveService.uploadFile(file.buffer, filename, signedFolderId);

      if (tipo === 'CANALIZACION') {
      exp.canalizacionDriveId = driveData.driveFileId;
    } else {
      exp.incorporacionFirmadaDriveId = driveData.driveFileId;
    }
    await this.expedienteRepo.save(exp);

      const tipoDoc = tipo === 'CANALIZACION'
      ? TipoDocumentoEnum.OFICIO_CANALIZACION
      : TipoDocumentoEnum.OFICIO_INCORPORACION;
    const folioEscaneado = `${tipo}-FIRMADO-${exp.folioExpediente}`;
    await this.registrarOficio({
      expedienteId,
      generadoPorId: userId,
      tipoDocumento: tipoDoc,
      folioOficio: folioEscaneado,
      nombreArchivoFederal: filename,
      urlArchivo: driveData.urlArchivo,
      esExterno: true,
    });

    return driveData;
  }

  /**
   * Consolida todos los enlaces necesarios para el Google Form Federal.
   */
  async obtenerPaqueteFederal(expedienteId: string): Promise<any> {
    const exp = await this.getExpediente(expedienteId);
    const oficios = await this.listarOficiosBeneficiario(expedienteId);
    const bitacora = await this.bitacoraRepo.find({ where: { expedienteId }, order: { fechaActividad: 'DESC' } });

    // Helper para buscar por tipo en Drive
    const findDriveUrl = (tipo: TipoDocumentoEnum) => oficios.find(o => o.tipoDocumento === tipo)?.urlArchivo || null;

    // Obtener URLs de los archivos firmados si existen
    const urlCanalizacion = exp.canalizacionDriveId ? `https://drive.google.com/file/d/${exp.canalizacionDriveId}/view` : null;
    const urlIncorporacionSign = exp.incorporacionFirmadaDriveId ? `https://drive.google.com/file/d/${exp.incorporacionFirmadaDriveId}/view` : null;

    return {
      documentos: {
        oficioCanalizacion: urlCanalizacion,
        oficioIncorporacion: urlIncorporacionSign || findDriveUrl(TipoDocumentoEnum.OFICIO_INCORPORACION),
        cedulaInicial:       findDriveUrl(TipoDocumentoEnum.F4_CEDULA_INICIAL),
        planTrabajo:         findDriveUrl(TipoDocumentoEnum.F3_PLAN_TRABAJO),
        planVida:            findDriveUrl(TipoDocumentoEnum.PLAN_VIDA),
        reporteDeInstancia:  findDriveUrl(TipoDocumentoEnum.REPORTE_SEMANAL_GUIA), 
      },
      fotosEvidencia: bitacora.filter(b => b.evidenciaUrl).map(b => b.evidenciaUrl),
      estatusCierre: {
        horasCumplidas: exp.avanceHoras,
        horasSentencia: exp.horasSentencia,
        estatusActual:  exp.estatusProceso,
        f5Cerrado:      exp.estatusF5Cerrado
      }
    };
  }

  /**
   * Registra los metadatos del oficio y sincroniza con Google Drive si hay buffer.
   */
  async registrarOficio(params: {
    expedienteId: string;
    generadoPorId: number;
    tipoDocumento: TipoDocumentoEnum;
    folioOficio: string;
    buffer?: Buffer;
    nombreArchivoFederal: string;
    urlArchivo?: string;
    esExterno?: boolean;
  }): Promise<OficioGenerado> {
    const { expedienteId, tipoDocumento, folioOficio, buffer, nombreArchivoFederal } = params;

      // IMPORTANTE: Para reportes y listas, el folioOficio ya debe venir con el índice (ej: REP-1-...)
      let oficio = await this.oficioRepo.findOne({
      where: { expedienteId, tipoDocumento, folioOficio },
    });

    if (!oficio) {
      oficio = this.oficioRepo.create({
        expedienteId,
        generadoPorId: params.generadoPorId,
        tipoDocumento,
        folioOficio,
        nombreArchivoFederal,
        urlArchivo: params.urlArchivo || '',
        esExterno: params.esExterno ?? false,
      });
    } else {
          oficio.nombreArchivoFederal = nombreArchivoFederal;
    }

    if (buffer) {
      try {
        let exp = await this.getExpediente(expedienteId);
        const ben = await this.getBeneficiario(exp.beneficiarioId);
        const folderName = `${ben.nombre.toUpperCase()} - ${exp.folioExpediente}`;

              exp.driveFolderId = await this.asegurarCarpetaBeneficiario(expedienteId);

              try {
                  const metaExp = exp.driveFolderId ? await this.driveService.getFileMetadata(exp.driveFolderId) : null;
          const metaOficio = oficio.driveFileId ? await this.driveService.getFileMetadata(oficio.driveFileId) : null;

                  const expInvalido = exp.driveFolderId && (!metaExp || metaExp.trashed);
          const oficioInvalido = oficio.driveFileId && (!metaOficio || metaOficio.trashed);

          if (expInvalido || oficioInvalido) {
             throw { code: 404, message: 'Resource is missing or in trash' };
          }

          if (oficio.driveFileId) {
            // Actualización (solo si el folio es idéntico)
            const driveData = await this.driveService.updateFile(oficio.driveFileId, buffer);
            oficio.urlArchivo = driveData.urlArchivo;
            oficio.esModificacion = true;
            oficio.motivoModificacion = 'Actualización automática del documento';
          } else {
            // Subida nueva
            this.logger.debug(`Subiendo nuevo archivo a Drive: ${nombreArchivoFederal} en carpeta ${exp.driveFolderId}`);
            const driveData = await this.driveService.uploadFile(buffer, nombreArchivoFederal, exp.driveFolderId!);
            
            if (driveData.driveFileId === 'DRIVE_DISABLED') {
              this.logger.warn('Google Drive está desactivado. El archivo solo se guardará localmente.');
            } else {
              oficio.driveFileId = driveData.driveFileId;
              oficio.urlArchivo = driveData.urlArchivo;
              this.logger.log(`Archivo subido con éxito: ${driveData.driveFileId}`);
            }
          }
        } catch (innerError: any) {
          const isNotFound = innerError.code === 404 || innerError.status === 404 ||
                             String(innerError.message || '').toLowerCase().includes('not found');

          if (isNotFound) {
            this.logger.warn(`Recurso en Drive no encontrado (404). Re-intentando subida limpia.`);
            oficio.driveFileId = null;
            exp.driveFolderId = await this.driveService.getOrCreateFolder(folderName);
            await this.expedienteRepo.save(exp);

            const driveData = await this.driveService.uploadFile(buffer, nombreArchivoFederal, exp.driveFolderId!);
            oficio.driveFileId = driveData.driveFileId;
            oficio.urlArchivo = driveData.urlArchivo;
          } else {
            this.logger.error(`Error en operación Drive: ${innerError.message}`);
            throw innerError;
          }
        }
      } catch (error: any) {
        this.logger.error(`Error crítico en sincronización Drive: ${error.message}`);
        // Fallback robusto: link local si falla la nube
        if (!oficio.urlArchivo || oficio.urlArchivo === 'DRIVE_DISABLED') {
           oficio.urlArchivo = `/civico/documentos/${nombreArchivoFederal}`;
        }
      }
    }

    return this.oficioRepo.save(oficio);
  }

  /**
   * Busca si el expediente ya tiene un folio asignado para ese tipo de documento.
   */
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

  /**
   * Obtiene un folio profesional estandarizado. 
   * Si ya existe un oficio de ese tipo para el expediente, devuelve el existente para re-uso.
   */
   private async obtenerFolioDocumento(tipo: TipoDocumentoEnum, expedienteId: string): Promise<string> {
    // 1. ¿Ya existe un oficio de este tipo para este expediente?
    const existente = await this.buscarFolioExistente(expedienteId, tipo);
    if (existente) {
          return existente.split('-V')[0];
    }

      const year = new Date().getFullYear();
    const prefix = this.getPrefixForTipo(tipo);
    const suffix = `/${year}`;

    // Buscar el último folio con este prefijo/año entre TODOS los tipos de documento,
      const last = await this.oficioRepo.createQueryBuilder('o')
      .where('o.folioOficio LIKE :pattern', { pattern: `${prefix}%${suffix}` })
      .orderBy('o.fechaGeneracion', 'DESC')
      .getOne();

    let nextNum = 1;

    if (last) {
      // Extraer número: SSyPC/.../0025/2026 o F3-0005/2026
      const matches = last.folioOficio.match(/(\d+)\//);
      if (matches) {
        nextNum = parseInt(matches[1], 10) + 1;
      }
    }

    const padded = String(nextNum).padStart(4, '0');
    return `${prefix}${padded}${suffix}`;
  }

  private getPrefixForTipo(tipo: TipoDocumentoEnum): string {
    switch (tipo) {
      case TipoDocumentoEnum.OFICIO_INCORPORACION:
      case TipoDocumentoEnum.OFICIO_CONCLUSION:
      case TipoDocumentoEnum.OFICIO_BAJA_DEFINITIVA:
      case TipoDocumentoEnum.OFICIO_CANALIZACION:
        return `SSyPC/SPRS/DGPDyPC/`;
      case TipoDocumentoEnum.F3_PLAN_TRABAJO:            return `F3-`;
      case TipoDocumentoEnum.F4_CEDULA_INICIAL:          return `F4-`;
      case TipoDocumentoEnum.PLAN_VIDA:                  return `PLAN-VIDA-`;
      case TipoDocumentoEnum.LISTA_ASISTENCIA:           return `LIST-ASIST-`;
      case TipoDocumentoEnum.REPORTE_SEMANAL_GUIA:       return `REP-SEM-`;
      case TipoDocumentoEnum.HOJA_PRESENTACION:          return `PRES-SOCIAL-`;
      default:                                           return `DOC-`;
    }
  }

  // Helper legacy (consecutivo viejo)
  private async obtenerFolioConsecutivo(extras: Record<string, unknown>): Promise<string> {
    if (extras['folioOficio']) return String(extras['folioOficio']);
    return this.obtenerFolioDocumento(TipoDocumentoEnum.OFICIO_INCORPORACION, 'GLOBAL');
  }


  async generarOficioIncorporacion(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    
    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.OFICIO_INCORPORACION, expedienteId);

    const esJuezFemenino = (exp.generoJuez ?? '').toUpperCase() === 'F';

    const buffer = await this.generarPdf('oficio_incorporacion', {
      numOficio:          folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      delitoImputado:     exp.delitoImputado ?? '—',
      horasSentencia:     exp.horasSentencia,
      folioExpediente:    exp.folioExpediente,
      // Metadata institucional
      fechaIncorporacion: fechaLargaDesde(exp.fechaInicioBeneficio ?? ben.fechaIngreso),
      fechaConclusion:    fechaLargaSinDia(exp.fechaTerminoBeneficio),
      fechaCanalizacion:  fechaLargaSinDia(exp.fechaOficioCanalizacion),
      diasProgramados:    formatDiasProgramados(exp.diasAsignadosJuzgado),
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargoCompleto:  'Juez Cívico Municipal Especializado en Faltas Administrativas para la Buena Convivencia Comunitaria',
      oficioCanalizacion: exp.oficioCanalizacion ? `ExFac. ${exp.oficioCanalizacion}` : '—',
      modalidadFalta:     exp.modalidadFalta ?? '—',
      esJuezFemenino,
      ...extras,
    });

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'INCORPORACION');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.OFICIO_INCORPORACION,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  async generarOficioConclusion(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    
    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.OFICIO_CONCLUSION, expedienteId);
    const esJuezFemenino = (exp.generoJuez ?? '').toUpperCase() === 'F';

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
      const verbosAccion = ['participó', 'participo', 'impartió', 'impartio', 'asistió', 'asistio', 'realizó', 'realizo', 'apoyó', 'apoyo', 'colaboró', 'colaboro', 'coordinó', 'coordino'];
      const tieneVerbo = verbosAccion.some(v => lowerDesc.startsWith(v));
      if (!tieneVerbo) desc = `Participó en el ${desc.charAt(0).toLowerCase() + desc.slice(1)}`;

      let strFecha = fechaLargaDesde(r.fecha);
      if (strFecha.startsWith('el ')) strFecha = strFecha.substring(3);

      return { descripcion: desc, fecha: strFecha };
    });

    const buffer = await this.generarPdf('oficio_conclusion', {
      numOficio:          folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      folioExpediente:    exp.folioExpediente,
      horasSentencia:     exp.horasSentencia,
      horasCumplidas,
      fechaInicio:        fechaLargaSinDia(ben.fechaIngreso),
      fechaConclusion:    fechaLarga(),
      fechaCanalizacion:  fechaLargaSinDia(exp.fechaOficioCanalizacion),
      juzgadoNombre:      exp.numJuzgadoCivico ?? 'Juzgado Cívico',
      juezNombre:         exp.juezControl ?? 'C. JUEZ DE CONTROL',
      juezCargoCompleto:  'Juez Cívico Municipal Especializado en Faltas Administrativas para la Buena Convivencia Comunitaria',
      oficioCanalizacion: exp.oficioCanalizacion ? `ExFac. ${exp.oficioCanalizacion}` : (exp.causaPenal),
      actividades,
      esJuezFemenino,
      esBeneficiarioFemenino: (exp.genero ?? '').toUpperCase() === 'F',
      ...extras,
    });

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'CONCLUSION');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.OFICIO_CONCLUSION,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  async generarInformeBaja(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    
    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.OFICIO_BAJA_DEFINITIVA, expedienteId);

    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const buffer = await this.generarPdf('oficio_baja_definitiva', {
      numOficio:          folio,
      fechaGeneracion:    fechaLarga(),
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      causaPenal:         exp.causaPenal,
      folioExpediente:    exp.folioExpediente,
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

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'BAJA');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.OFICIO_BAJA_DEFINITIVA,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  async generarFichaIncidencias(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    
    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.INFORME_INCIDENCIAS, expedienteId);
    
    const horasCumplidas = await this.calcularHorasCumplidas(expedienteId);
    const incidencias = await this.incidenciaRepo.find({
      where: { expedienteId },
      order: { fechaIncidencia: 'ASC' },
    });

    const buffer = await this.generarPdf('ficha_incidencias', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      folioExpediente:    exp.folioExpediente,
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
        ft = ft.charAt(0).toUpperCase() + ft.slice(1);
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

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'INCIDENCIAS');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.INFORME_INCIDENCIAS,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  async generarF3PlanTrabajo(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const f3  = await this.f3Repo.findOne({ where: { expedienteId } });
    if (!f3) throw new NotFoundException(`No existe un F3 (Plan de Trabajo) para el expediente ${expedienteId}`);

    const coordinador = await this.userRepo.findOne({ where: { id: f3.coordinadorId } });

    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.F3_PLAN_TRABAJO, expedienteId);

    const buffer = await this.generarPdf('f3_plan_trabajo', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      folioExpediente:    exp.folioExpediente,
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

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'F3_PLAN_TRABAJO');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.F3_PLAN_TRABAJO,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  async generarF4CedulaInicial(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    
      const f4  = await this.f4Repo.findOne({ where: { expedienteId } });
    if (!f4) throw new NotFoundException(`No existe un F4 (Cédula Inicial) para el expediente ${expedienteId}`);

    const f3  = await this.f3Repo.findOne({ where: { expedienteId } });
    
    // Calculamos edad
    const edad = calcularEdad(exp.fechaNacimiento);

    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.F4_CEDULA_INICIAL, expedienteId);

    const buffer = await this.generarPdf('f4_cedula_inicial', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      edad:               edad,
      curp:               exp.curp,
      estadoCivil:        exp.estadoCivil ?? '—',
      domicilioCompleto:  exp.domicilioCompleto,
      codigoPostal:       exp.codigoPostal ?? '—',
      municipio:          exp.municipio ?? '—',
      ocupacionActual:    exp.ocupacionActual ?? '—',
      fechaIngreso:       formatDate(ben.fechaIngreso),
      telefonoContacto:   exp.telefonoContacto ?? '—',
      fotoBeneficiario: await (async () => {
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

      proyectoVida:       f3?.proyectoVidaF3 ?? {},
      metasPrograma:      f3?.metasPrograma ?? '',
      actividadesPlan:    f3?.actividadesPlan ?? {},
      observacionesPlan:  f3?.observacionesPlan ?? '',

      procesoIngreso:         f4.procesoIngreso ?? '—',
      seguimientoActividades: f4.seguimientoActividades ?? {},

      tituloDocumento:    'FICHA TECNICA DE SEGUIMIENTO',
      ...extras,
    });

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'F4_CEDULA_INICIAL');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.F4_CEDULA_INICIAL,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  async generarPlanVida(
    expedienteId: string,
    userId: number,
    extras: Record<string, unknown> = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.PLAN_VIDA, expedienteId);

    const f3 = await this.f3Repo.findOne({ where: { expedienteId } });

      const primerBitacora = await this.bitacoraRepo.findOne({
      where: { expedienteId },
      order: { createdAt: 'ASC' },
      relations: ['guia']
    });
    const nombreGuiaBitacora = primerBitacora?.guia?.nombre?.toUpperCase();

      const registrosBitacora = await this.bitacoraRepo.find({
      where: { expedienteId, evidenciaUrl: Not(IsNull()) },
      order: { fechaActividad: 'ASC' }
    });

    const evidencias = await Promise.all(registrosBitacora.map(async (reg) => {
      const dataUri = await this.resolveEvidenciaUrlToDataUri(reg.evidenciaUrl);
      return {
        fecha: formatDate(reg.fechaActividad),
        actividad: reg.detalleIncidencia || reg.observaciones || 'Actividad sin detalle',
        url: dataUri
      };
    }));

    const evidenciasFiltradas = evidencias.filter(e => e.url !== null);

        //           temporalidad→TEMPORALIDAD, seguimiento→SEGUIMIENTO, cumplimiento→OBSERVACIONES
    type ActividadF3 = { estatus?: string; objetivo?: string; cumplimiento?: string; vinculacion?: string; temporalidad?: string; seguimiento?: string };
    const actividadesPlan = (f3 as any)?.actividadesPlan as Record<string, ActividadF3> | null | undefined;
    const ejesFromF3 = actividadesPlan && Object.keys(actividadesPlan).length > 0
      ? Object.entries(actividadesPlan).map(([key, val]) => ({
          eje:           key,
          estadoInicial: val?.estatus      || '',
          accion:        val?.objetivo     || '',
          vinculacion:   val?.vinculacion  || '',
          temporalidad:  val?.temporalidad || '',
          seguimiento:   val?.seguimiento  || '',
          observaciones: val?.cumplimiento || '',
        }))
      : [
          { eje: 'EDUCATIVA',   estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'LABORAL',     estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'FAMILIAR',    estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'DEPORTIVA',   estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'CULTURAL',    estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'PSICOSOCIAL', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'PSICOLOGICA', estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
          { eje: 'ADICCIONES',  estadoInicial: '', accion: '', vinculacion: '', temporalidad: '', seguimiento: '', observaciones: '' },
        ];

    const buffer = await this.generarPdf('plan_vida', {
      numOficio:          folio,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      curp:               exp.curp,
      folioExpediente:    exp.folioExpediente,
      fechaIngreso:       fechaLargaFormat(ben.fechaIngreso),
      nombreGuia:         extras['nombreGuia'] ?? nombreGuiaBitacora ?? '—',
      fechaTemporalidad:  fechaLargaFormat(exp.fechaTerminoBeneficio || (f3 as any)?.fechaTerminoEstimada),
      
      // Logos e Imágenes
      logoEncabezado:    this.logoEncabezadoSspc,
      logoGrecas:        this.logoGrecas,
      
      ejes:               extras['ejes'] ?? ejesFromF3,
      evidencias:         evidenciasFiltradas,
      
      tituloDocumento:    'PLAN DE VIDA INDIVIDUALIZADA',
      ...extras,
    });

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'PLAN_VIDA');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.PLAN_VIDA,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  /**
   * Genera el siguiente número correlativo para un tipo de documento y expediente.
   */
  private async obtenerSiguienteNumeroDocumento(expedienteId: string, tipo: TipoDocumentoEnum): Promise<number> {
    const count = await this.oficioRepo.count({
      where: { expedienteId, tipoDocumento: tipo, folioOficio: Not(Like('PLANT-%')) },
    });
    return count + 1;
  }


  /**
   * Genera la plantilla en blanco para imprimir (GET) y la sube a Drive.
   * Además, si existen registros en bitácora para este expediente que aún no
   * tienen un oficio PDF asociado, los genera y los sube también.
   * Siempre devuelve la plantilla en blanco como respuesta HTTP.
   */
  async generarTemplateListaAsistencia(
    expedienteId: string,
    userId: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const guia = await this.obtenerGuiaAsignado(expedienteId);

      const bufferPlantilla = await this.generarPdf('lista_asistencia', {
      logoPresentacion1:  this.logoPresentacion1,
      logoPresentacion2:  this.logoPresentacion2,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      nombreGuia:         guia?.nombre?.toUpperCase() || '—',
      tituloDocumento:    'PLANTILLA DE ASISTENCIA - PARA LLENADO MANUAL',
      fecha:              '',
      actividades:        [],
      filasVacias:        10,
    });

      const folioPlantilla = `PLANT-LIST-${exp.folioExpediente}`;
    const filenamePlantilla = `PLANTILLA PLANTILLA DE ASISTENCIA IMPRIMIR - ${ben.nombre.toUpperCase()}.pdf`;
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.LISTA_ASISTENCIA,
      folioOficio:          folioPlantilla,
      buffer:               bufferPlantilla,
      nombreArchivoFederal: filenamePlantilla,
    });

      const bitacoraRecords = await this.bitacoraRepo.find({
      where: { expedienteId },
      order: { fechaActividad: 'ASC' },
      relations: ['guia'],
    });

    if (bitacoraRecords.length > 0) {
      // Contar oficios secuenciales ya existentes (excluir la plantilla fija)
      const oficiosExistentes = await this.oficioRepo.count({
        where: {
          expedienteId,
          tipoDocumento: TipoDocumentoEnum.LISTA_ASISTENCIA,
          folioOficio:   Not(Like('PLANT-%')),
        },
      });

      if (oficiosExistentes < bitacoraRecords.length) {
        const baseFolio = await this.obtenerFolioDocumento(TipoDocumentoEnum.LISTA_ASISTENCIA, expedienteId);

        for (let i = oficiosExistentes; i < bitacoraRecords.length; i++) {
          const bit = bitacoraRecords[i];
          const numero = i + 1;
          const folioUnico = `${baseFolio}-V${numero}`;
          const guiaBit = bit.guia ?? await this.userRepo.findOne({ where: { id: bit.guiaId } });

          // Resolver nombre de actividad por actividadId
          let nombreActividad = 'Actividad de seguimiento';
          if (bit.actividadId) {
            const act = await this.actividadRepo.findOne({ where: { id: bit.actividadId } });
            if (act) nombreActividad = act.nombre;
          }

          // Iniciales del nombre del beneficiario para simular firma
          const inicialesBit = ben.nombre
            .split(/\s+/)
            .filter(Boolean)
            .map(w => w[0].toUpperCase())
            .join('');

          const dataUriHist = await this.resolveEvidenciaUrlToDataUri(bit.evidenciaUrl);

          const bufferLista = await this.generarPdf('lista_asistencia', {
            numOficio:          folioUnico,
            logoPresentacion1:  this.logoPresentacion1,
            logoPresentacion2:  this.logoPresentacion2,
            nombreBeneficiario: ben.nombre.toUpperCase(),
            nombreGuia:         guiaBit?.nombre?.toUpperCase() || '—',
            fecha:              formatDate(bit.fechaActividad),
            fechaHoja:          formatDate(bit.fechaActividad),
            observaciones:      bit.observaciones || '',
            actividades: [
              {
                horario:        bit.horasCubiertas != null ? `${bit.horasCubiertas} HORAS` : '—',
                actividad:      nombreActividad,
                sede:           bit.sede || '—',
                firma:          inicialesBit,
                asistencia:     bit.asistencia || '—',
                evidenciaUrl:   dataUriHist || '',
              },
            ],
          });

          const filenameLista = this.generarNombreArchivo(folioUnico, ben.nombre, `LISTA ${numero}`);
          await this.registrarOficio({
            expedienteId,
            generadoPorId:        userId,
            tipoDocumento:        TipoDocumentoEnum.LISTA_ASISTENCIA,
            folioOficio:          folioUnico,
            buffer:               bufferLista,
            nombreArchivoFederal: filenameLista,
          });
        }
      }
    }

    return { buffer: bufferPlantilla, filename: filenamePlantilla };
  }

  /**
   * Procesa la asistencia real (POST), guarda en Bitácora y sube a Drive.
   */
  async procesarAsistenciaHibrida(datos: any, userId: number): Promise<{ buffer: Buffer; filename: string }> {
    const { expedienteId, fecha, horasCubiertas, asistencia, observaciones, actividadId, horario, sede, evidenciaUrl } = datos;

    if (!expedienteId) {
      const buffer = await this.generarPdf('lista_asistencia', { ...datos, logoPresentacion1: this.logoPresentacion1 });
      return { buffer, filename: `asistencia_generica_${Date.now()}.pdf` };
    }

    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

      const guia = await this.userRepo.findOne({ where: { id: userId } });
    await this.bitacoraRepo.save({
      expedienteId,
      guiaId: userId,
      fechaActividad: fecha ? new Date(fecha) : new Date(),
      horasCubiertas: horasCubiertas || 0,
      asistencia: asistencia || AsistenciaEnum.PRESENTE,
      observaciones: observaciones || '',
      actividadId: actividadId || null,
      sede: sede || null,
      evidenciaUrl: evidenciaUrl || null,
    });

      const numero = await this.obtenerSiguienteNumeroDocumento(expedienteId, TipoDocumentoEnum.LISTA_ASISTENCIA);
    const baseFolio = await this.obtenerFolioDocumento(TipoDocumentoEnum.LISTA_ASISTENCIA, expedienteId);
    const folioUnico = `${baseFolio}-V${numero}`;

      await this.actualizarAvanceHoras(expedienteId);

      // Resolver el nombre de la actividad por actividadId (si existe)
    let nombreActividad = datos.actividadNombre || 'Asistencia registrada vía sistema';
    if (actividadId) {
      const act = await this.actividadRepo.findOne({ where: { id: actividadId } });
      if (act) nombreActividad = act.nombre;
    }

    // Iniciales del nombre del beneficiario para simular firma
    const inicialesPost = ben.nombre
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w[0].toUpperCase())
      .join('');

    const dataUriPost = await this.resolveEvidenciaUrlToDataUri(evidenciaUrl);

    const buffer = await this.generarPdf('lista_asistencia', {
      numOficio:          folioUnico,
      logoPresentacion1:  this.logoPresentacion1,
      logoPresentacion2:  this.logoPresentacion2,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      nombreGuia:         guia?.nombre?.toUpperCase() || '—',
      fecha:              formatDate(fecha) || fechaLarga(),
      fechaHoja:          formatDate(fecha) || fechaLarga(),
      observaciones,
      actividades: [
        {
          horario:        horasCubiertas != null ? `${horasCubiertas} HORAS` : '—',
          actividad:      nombreActividad,
          sede:           sede || '—',
          firma:          inicialesPost,
          asistencia:     asistencia || '—',
          evidenciaUrl:   dataUriPost || '',
        },
      ],
    });

      const filename = this.generarNombreArchivo(folioUnico, ben.nombre, `LISTA ${numero}`);
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.LISTA_ASISTENCIA,
      folioOficio:          folioUnico,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }


  /**
   * Genera la plantilla en blanco de reporte semanal para imprimir (GET) y la sube a Drive.
   * Además, si existen registros de bitácora para este expediente, agrupa los que aún
   * no tienen reporte PDF por semana ISO y los genera/sube automáticamente.
   * Siempre devuelve la plantilla en blanco como respuesta HTTP.
   */
  async generarTemplateReporteSemanal(
    expedienteId: string,
    userId: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const guia = await this.obtenerGuiaAsignado(expedienteId);

      const bufferPlantilla = await this.generarPdf('reporte_semanal', {
      logoEncabezadoSspc: this.logoEncabezadoSspc,
      logoGrecas:         this.logoGrecas,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      nombreGuia:         guia?.nombre?.toUpperCase() || '—',
      tituloDocumento:    'PLANTILLA REPORTE SEMANAL - PARA LLENADO MANUAL',
      actividades:        [],
    });

      const folioPlantilla = `PLANT-REP-${exp.folioExpediente}`;
    const filenamePlantilla = `PLANTILLA REPORTE IMPRIMIR - ${ben.nombre.toUpperCase()}.pdf`;
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.REPORTE_SEMANAL_GUIA,
      folioOficio:          folioPlantilla,
      buffer:               bufferPlantilla,
      nombreArchivoFederal: filenamePlantilla,
    });

      const bitacoraRecords = await this.bitacoraRepo.find({
      where: { expedienteId },
      order: { fechaActividad: 'ASC' },
      relations: ['guia'],
    });

    if (bitacoraRecords.length > 0) {
      const semanas = this.agruparBitacoraEnSemanas(bitacoraRecords);

      const oficiosExistentes = await this.oficioRepo.count({
        where: {
          expedienteId,
          tipoDocumento: TipoDocumentoEnum.REPORTE_SEMANAL_GUIA,
          folioOficio:   Not(Like('PLANT-%')),
        },
      });

      if (oficiosExistentes < semanas.length) {
        const baseFolio = await this.obtenerFolioDocumento(TipoDocumentoEnum.REPORTE_SEMANAL_GUIA, expedienteId);

        for (let i = oficiosExistentes; i < semanas.length; i++) {
          const semana = semanas[i];
          const numero = i + 1;
          const folioUnico = `${baseFolio}-V${numero}`;
          const guiaSemana = semana.registros[0]?.guia
            ?? await this.userRepo.findOne({ where: { id: semana.registros[0]?.guiaId } });

          const listaActividades = semana.registros.map(r => ({
            asistencia:  r.asistencia,                            // valor completo del enum, no abreviado
            fecha:       formatDate(r.fechaActividad),
            descripcion: r.observaciones || 'Actividad de seguimiento',
          }));

                  const obsUnidas = semana.registros
            .filter(r => r.observaciones)
            .map(r => r.observaciones!.trim())
            .join(' | ');

          const bufferReporte = await this.generarPdf('reporte_semanal', {
            numOficio:          folioUnico,
            logoEncabezadoSspc: this.logoEncabezadoSspc,
            logoGrecas:         this.logoGrecas,
            nombreBeneficiario: ben.nombre.toUpperCase(),
            nombreGuia:         guiaSemana?.nombre?.toUpperCase() || '—',
            fecha:              fechaLarga(),
            fechaPeriodo:       `${formatDate(semana.inicio)} al ${formatDate(semana.fin)}`,
            semanaNumero:       semana.isoSemana,
            observaciones:      obsUnidas || '',
            actividades:        listaActividades,
          });

          const filenameReporte = this.generarNombreArchivo(folioUnico, ben.nombre, `REPORTE ${numero}`);
          await this.registrarOficio({
            expedienteId,
            generadoPorId:        userId,
            tipoDocumento:        TipoDocumentoEnum.REPORTE_SEMANAL_GUIA,
            folioOficio:          folioUnico,
            buffer:               bufferReporte,
            nombreArchivoFederal: filenameReporte,
          });
        }
      }
    }

    return { buffer: bufferPlantilla, filename: filenamePlantilla };
  }

  /**
   * Procesa el reporte semanal real (POST), sube a Drive.
   * NO guarda en Bitácora para evitar duplicar horas (estos ya vienen de los POST diarios).
   */
  async procesarReporteSemanalHibrido(datos: any, userId: number): Promise<{ buffer: Buffer; filename: string }> {
    const { expedienteId, semanaNumero, fechaInicio, fechaFin, observaciones, renglones } = datos;

    if (!expedienteId) {
      const buffer = await this.generarPdf('reporte_semanal', { ...datos, logoEncabezadoSspc: this.logoEncabezadoSspc });
      return { buffer, filename: `reporte_generico_${Date.now()}.pdf` };
    }

    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);
    const guia = await this.userRepo.findOne({ where: { id: userId } });

      const numero = await this.obtenerSiguienteNumeroDocumento(expedienteId, TipoDocumentoEnum.REPORTE_SEMANAL_GUIA);
    const baseFolio = await this.obtenerFolioDocumento(TipoDocumentoEnum.REPORTE_SEMANAL_GUIA, expedienteId);
    const folioUnico = `${baseFolio}-V${numero}`;

      const listaActividades = Array.isArray(renglones) ? renglones.map(r => ({
      asistencia:  r.asistencia || 'P',
      fecha:       formatDate(r.fecha),
      descripcion: r.descripcion || 'Sin descripción'
    })) : [];

      const buffer = await this.generarPdf('reporte_semanal', {
      numOficio:          folioUnico,
      logoEncabezadoSspc: this.logoEncabezadoSspc,
      logoGrecas:         this.logoGrecas,
      nombreBeneficiario: ben.nombre.toUpperCase(),
      nombreGuia:         guia?.nombre?.toUpperCase() || '—',
      fecha:              fechaLarga(),
      fechaPeriodo:       `${formatDate(fechaInicio)} al ${formatDate(fechaFin)}`,
      semanaNumero,
      observaciones,
      actividades:        listaActividades,
    });

      const filename = this.generarNombreArchivo(folioUnico, ben.nombre, `REPORTE ${numero}`);
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.REPORTE_SEMANAL_GUIA,
      folioOficio:          folioUnico,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
  }

  /**
   * Recalcula el total de horas cumplidas y actualiza el campo avance_horas en el expediente.
   */
  private async actualizarAvanceHoras(expedienteId: string): Promise<void> {
    const total = await this.calcularHorasCumplidas(expedienteId);
    await this.expedienteRepo.update({ idUUID: expedienteId }, { avanceHoras: total });
    this.logger.log(`Horas actualizadas para expediente ${expedienteId}: ${total} hrs.`);
  }

  private async obtenerGuiaAsignado(expedienteId: string): Promise<User | null> {
    const bit = await this.bitacoraRepo.findOne({
      where: { expedienteId },
      order: { createdAt: 'DESC' },
      relations: ['guia']
    });
    return bit?.guia || null;
  }

  // Lista todos los oficios y documentos generados para un expediente específico.
  async listarOficiosBeneficiario(expedienteId: string): Promise<OficioGenerado[]> {
    return this.oficioRepo.find({
      where: { expedienteId },
      order: { fechaGeneracion: 'DESC' },
    });
  }


  /**
   * Genera el reporte de notas de evolución psicológica.
   */
  async generarNotaEvolucion(
    expedienteId: string,
    userId: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const exp = await this.getExpediente(expedienteId);
    const ben = await this.getBeneficiario(exp.beneficiarioId);

    // Folio estandarizado profesional
    const folio = await this.obtenerFolioDocumento(TipoDocumentoEnum.NOTA_EVOLUCION_PSICOLOGICA, expedienteId);

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
      cedulaPsicologo: s.cedulaProfesional || '—',
    }));

    const buffer = await this.generarPdf('nota_evolucion', {
      numOficio:          folio,
      nombreUsuario:      ben.nombre.toUpperCase(),
      edad:               calcularEdad(exp.fechaNacimiento),
      sexo:               (exp.genero || '—').charAt(0).toUpperCase(),
      folioExpediente:    exp.folioExpediente,
      sesiones,
      logoEncabezado:     this.logoEncabezado,
      logoGrecas:         this.logoGrecas,
    });

    const filename = this.generarNombreArchivo(folio, ben.nombre, 'NOTA_EVOLUCION');
    await this.registrarOficio({
      expedienteId,
      generadoPorId:        userId,
      tipoDocumento:        TipoDocumentoEnum.NOTA_EVOLUCION_PSICOLOGICA,
      folioOficio:          folio,
      buffer,
      nombreArchivoFederal: filename,
    });

    return { buffer, filename };
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

  // Genera un nombre de archivo profesional: TIPO - NOMBRE - FOLIO.pdf
  private generarNombreArchivo(folio: string, nombreBeneficiario: string, tipo: string): string {
    const folioSanitizado = folio.replace(/\//g, '-');
    return `${tipo.toUpperCase()} - ${nombreBeneficiario.toUpperCase()} - ${folioSanitizado}.pdf`;
  }

  /** Agrupa registros de bitácora por semana ISO (lunes–domingo). */
  private agruparBitacoraEnSemanas(
    records: BitacoraCivica[],
  ): Array<{ isoSemana: number; inicio: Date; fin: Date; registros: BitacoraCivica[] }> {
    const map = new Map<string, { isoSemana: number; inicio: Date; fin: Date; registros: BitacoraCivica[] }>();

    for (const r of records) {
      // Parsear la fecha en UTC puro para evitar desfase de zona horaria.
      // TypeORM devuelve columnas `date` como string "YYYY-MM-DD" o como Date UTC midnight.
      let yyyy: number, mo: number, dd: number;
      if (typeof r.fechaActividad === 'string') {
        [yyyy, mo, dd] = (r.fechaActividad as string).split('-').map(Number);
        mo -= 1; // 0-indexed
      } else {
        const dtmp = r.fechaActividad as Date;
        yyyy = dtmp.getUTCFullYear();
        mo   = dtmp.getUTCMonth();
        dd   = dtmp.getUTCDate();
      }

          const d = new Date(Date.UTC(yyyy, mo, dd));
      const dayOfWeek = d.getUTCDay(); // 0=Dom, 1=Lun...
      const diffToMonday = dd - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(Date.UTC(yyyy, mo, diffToMonday));
      const sunday = new Date(Date.UTC(yyyy, mo, diffToMonday + 6));

      // Número ISO de semana (ISO 8601)
      const thursdayOfWeek = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 3));
      const jan4 = new Date(Date.UTC(thursdayOfWeek.getUTCFullYear(), 0, 4));
      const isoSemana =
        1 +
        Math.round(
          ((thursdayOfWeek.getTime() - jan4.getTime()) / 86400000 -
            3 +
            ((jan4.getUTCDay() + 6) % 7)) /
            7,
        );

      const key = monday.toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, { isoSemana, inicio: monday, fin: sunday, registros: [] });
      }
      map.get(key)!.registros.push(r);
    }

    return Array.from(map.values()).sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  /** Convierte AsistenciaEnum a la abreviatura para el reporte semanal. */
  private asistenciaAbreviada(asistencia: AsistenciaEnum | string): string {
    const mapa: Record<string, string> = {
      PRESENTE:              'P',
      FALTA_JUSTIFICADA:     'FJ',
      FALTA_INJUSTIFICADA:   'FI',
      PRESENTE_PARCIAL:      'PP',
    };
    return mapa[asistencia] ?? String(asistencia);
  }

  /**
   * Resuelve una URL de evidencia (local o Drive) a un Data URI (base64) 
   * apto para incrustar en PDFs generados por Puppeteer.
   */
  private async resolveEvidenciaUrlToDataUri(url?: string | null): Promise<string | null> {
    if (!url) return null;
    const trimmed = url.trim();

    try {
      // 1. Caso: Es un link de Google Drive
      const driveFileId = this.driveService.extractFileId(trimmed);
      if (driveFileId) {
        this.logger.debug(`Descargando imagen de Drive para PDF: ${driveFileId}`);
        const buffer = await this.driveService.getFileContent(driveFileId);
        // Asumimos JPEG/PNG (Drive lo maneja)
        const base64 = buffer.toString('base64');
        return `data:image/jpeg;base64,${base64}`;
      }

      // 2. Caso: Es una ruta local (fallback para legado o pruebas)
      if (!trimmed.startsWith('http') && fs.existsSync(trimmed)) {
        return toDataUri(trimmed);
      }

      // 3. Caso: Es un link HTTP directo (no Drive) o algo que no podemos procesar
      // Lo devolvemos tal cual por si Puppeteer puede con él (ej: link directo a AWS S3)
      return trimmed;
    } catch (error: any) {
      this.logger.error(`Error al resolver evidencia ${url}: ${error.message}`);
      return null;
    }
  }
}


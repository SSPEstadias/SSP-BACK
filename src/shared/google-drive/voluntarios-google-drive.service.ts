import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
 
const PDFDocument = require('pdfkit');
 
// ─── Colores del diseño ───────────────────────────────────────
const VINO = '#7B1A38';
const DORADO = '#C8A84B';
const BLANCO = '#FFFFFF';
const NEGRO = '#1A1A1A';
const GRIS_CLARO = '#F5F5F5';
 
interface PersonaData {
  id: string;
  folio?: string;
  nombre: string;
  sobrenombre?: string;
  edad?: string;
  fechaNacimiento?: string;
  curp?: string;
  lugarOrigen?: string;
  motivoIngreso?: string;
  fechaInicioTratamiento?: string;
  fechaTerminoTratamiento?: string;   
  religion?: string;
  practicaDeporte?: string;
  cualDeporte?: string;
  pasatiempo?: string;
  tieneActaNacimiento?: string;
  lugarNacimientoRegistro?: string;
  personasRegistraron?: string;
  sabeLeerEscribir?: string;
  gradoMaximoEstudios?: string;
  leGustariaEstudiar?: string;
  certificadoPrimaria?: boolean;
  certificadoSecundaria?: boolean;
  certificadoBachillerato?: boolean;
  nombrePlantel?: string;
  direccionPlantel?: string;
  fechaTerminoPlantel?: string;
  trabajaFormal?: string;
  funcionesTrabajo?: string;
  leGustariaCambiarTrabajo?: string;
  sabeOficio?: string;
  leGustariaAprenderOficio?: string;
  padecimientoEnfermedad?: string;
  servicioSalud?: string;
  cuentaTratamiento?: string;
  enfermedadTransmisionSexual?: string;
  necesitaLentes?: string;
  atencionPsicologica?: string;
  contacto1Nombre?: string;
  contacto1Relacion?: string;
  contacto1Telefono?: string;
  contacto2Nombre?: string;
  contacto2Relacion?: string;
  contacto2Telefono?: string;
  estado?: string;
}
 
@Injectable()
export class VoluntariosGoogleDriveService {
  private readonly logger = new Logger(VoluntariosGoogleDriveService.name);
  private drive: drive_v3.Drive | null = null;
  private rootFolderId: string | null = null;
 
  private normalizeFolderId(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    const folderMatch = trimmed.match(/(?:\/folders\/|id=)([a-zA-Z0-9_-]+)/i);
    if (folderMatch?.[1]) return folderMatch[1];
    const segments = trimmed.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  }
 
  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_DRIVE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_DRIVE_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GOOGLE_DRIVE_REFRESH_TOKEN');
    this.rootFolderId = this.normalizeFolderId(
      this.configService.get<string>('VOLUNTARIADO_DRIVE_FOLDER_ID'),
    );
 
    if (!clientId || !clientSecret || !refreshToken || !this.rootFolderId) {
      this.logger.warn('Credenciales OAuth2 de Google Drive incompletas para Voluntarios.');
      return;
    }
 
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      this.logger.log('Google Drive Service (Voluntarios) inicializado con éxito.');
    } catch (error: any) {
      this.logger.error(`Error al inicializar Google Drive Service: ${error.message}`);
    }
  }
 
  async getOrCreateFolder(name: string, parentId?: string): Promise<string> {
    if (!this.drive) return 'DRIVE_DISABLED';
    const parent = this.normalizeFolderId(parentId) || this.rootFolderId;
    if (!parent) throw new InternalServerErrorException('No se pudo resolver la carpeta padre');
 
    try {
      const res = await this.drive.files.list({
        q: `name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and '${parent}' in parents and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
 
      if (res.data.files && res.data.files.length > 0) return res.data.files[0].id!;
 
      const folder = await this.drive.files.create({
        requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parent] },
        fields: 'id',
        supportsAllDrives: true,
      });
 
      this.logger.log(`Carpeta creada: ${name} (ID: ${folder.data.id})`);
      return folder.data.id!;
    } catch (error: any) {
      this.logger.error(`Error en getOrCreateFolder (${name}): ${error.message}`);
      throw new InternalServerErrorException(`Error al gestionar carpeta en Drive: ${error.message}`);
    }
  }
 
  async getNextFolioNumber(): Promise<number> {
    if (!this.drive) return 1;
 
    try {
      const res = await this.drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${this.rootFolderId}' in parents and trashed = false`,
        fields: 'files(name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        pageSize: 1000,
      });
 
      if (!res.data.files || res.data.files.length === 0) return 1;
 
      const numbers = res.data.files
        .map(file => {
          const match = file.name?.match(/^(\d+)\s*[-_]?\s*/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => !isNaN(n));
 
      return Math.max(...numbers, 0) + 1;
    } catch (error: any) {
      this.logger.error(`Error obteniendo siguiente número de folio: ${error.message}`);
      return 1;
    }
  }
 
  // ─── Encabezado de sección ───────────────────────────────────
  private drawSeccionHeader(doc: any, titulo: string) {
    const y = doc.y;
    // Rectángulo vino de fondo
    doc.rect(40, y, 515, 22).fill(VINO);
    // Barra dorada izquierda
    doc.rect(40, y, 5, 22).fill(DORADO);
    // Texto blanco
    doc.fontSize(11).font('Helvetica-Bold').fillColor(BLANCO)
      .text(titulo, 52, y + 5, { width: 500 });
    doc.fillColor(NEGRO);
    doc.moveDown(0.6);
  }
 
  // ─── Fila de campo ───────────────────────────────────────────
  private drawCampo(doc: any, label: string, value?: string | boolean | null, indent = false) {
    const val = value === null || value === undefined || value === ''
      ? 'N/A'
      : typeof value === 'boolean'
        ? value ? 'Sí' : 'No'
        : String(value);
 
    const leftX = indent ? 55 : 40;
    const labelWidth = 200;
    const valueX = leftX + labelWidth;
    const y = doc.y;
 
    doc.fontSize(9).font('Helvetica-Bold').fillColor(VINO)
      .text(label + ':', leftX, y, { width: labelWidth, lineBreak: false });
    doc.fontSize(9).font('Helvetica').fillColor(NEGRO)
      .text(val, valueX, y, { width: 300 });
 
    doc.moveDown(0.35);
  }
 
  // ─── Certificados (campo especial combinado) ─────────────────
  private drawCertificados(doc: any, primaria?: boolean, secundaria?: boolean, bachillerato?: boolean) {
    const partes: string[] = [];
    if (primaria) partes.push('Primaria');
    if (secundaria) partes.push('Secundaria');
    if (bachillerato) partes.push('Bachillerato');
    const val = partes.length > 0 ? partes.join(', ') : 'Ninguno';
    this.drawCampo(doc, 'Certificados', val);
  }
 
  private generatePersonPDF(persona: PersonaData, folioNumber: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const buffers: Buffer[] = [];
        const doc = new PDFDocument({ size: 'A4', margin: 0 });
 
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
 
        const pageWidth = 595;
 
        // ─── HEADER VINO ─────────────────────────────────────
        doc.rect(0, 0, pageWidth, 80).fill(VINO);
 
        // Título principal
        doc.fontSize(22).font('Helvetica-Bold').fillColor(BLANCO)
          .text('RECONECTA CON LA PAZ', 0, 15, { align: 'center', width: pageWidth });
 
        // Subtítulos
        doc.fontSize(10).font('Helvetica').fillColor(BLANCO)
          .text('Gobierno del Estado de Oaxaca', 0, 42, { align: 'center', width: pageWidth });
        doc.fontSize(10).font('Helvetica').fillColor(BLANCO)
          .text('Centro de Rehabilitación Camino Hacia La Fe', 0, 56, { align: 'center', width: pageWidth });
 
        // Línea dorada
        doc.rect(0, 80, pageWidth, 5).fill(DORADO);
 
        // ─── FOLIO ───────────────────────────────────────────
        doc.moveDown(0);
        doc.y = 100;
        doc.fontSize(13).font('Helvetica-Bold').fillColor(VINO)
          .text(`FOLIO: ${persona.folio || String(folioNumber).padStart(4, '0')}`, 40, doc.y);
        doc.moveDown(0.8);
 
        // ─── I. GENERALES ────────────────────────────────────
        this.drawSeccionHeader(doc, 'I. GENERALES');
        this.drawCampo(doc, 'Nombre', persona.nombre);
        this.drawCampo(doc, 'Sobrenombre', persona.sobrenombre);
        this.drawCampo(doc, 'Edad', persona.edad);
        this.drawCampo(doc, 'Fecha de nacimiento', persona.fechaNacimiento);
        this.drawCampo(doc, 'CURP', persona.curp);
        this.drawCampo(doc, 'Lugar de origen', persona.lugarOrigen);
        this.drawCampo(doc, 'Motivo de ingreso', persona.motivoIngreso);
        this.drawCampo(doc, 'Fecha inicio tratamiento', persona.fechaInicioTratamiento);
        this.drawCampo(doc, 'Fecha término tratamiento', persona.fechaTerminoTratamiento);
        this.drawCampo(doc, 'Religión', persona.religion);
        this.drawCampo(doc, 'Practica deporte', persona.practicaDeporte);
        if (persona.practicaDeporte === 'Sí' || persona.practicaDeporte === 'Si') {
          this.drawCampo(doc, '¿Cuál deporte?', persona.cualDeporte, true);
        }
        this.drawCampo(doc, 'Pasatiempo', persona.pasatiempo);
        this.drawCampo(doc, 'Tiene acta de nacimiento', persona.tieneActaNacimiento);
        this.drawCampo(doc, 'Lugar de registro de nacimiento', persona.lugarNacimientoRegistro);
        this.drawCampo(doc, 'Personas que registraron', persona.personasRegistraron);
        doc.moveDown(0.3);
 
        // ─── II. ESCOLARIDAD ─────────────────────────────────
        this.drawSeccionHeader(doc, 'II. ESCOLARIDAD');
        this.drawCampo(doc, 'Sabe leer y escribir', persona.sabeLeerEscribir);
        this.drawCampo(doc, 'Grado máximo de estudios', persona.gradoMaximoEstudios);
        this.drawCampo(doc, 'Le gustaría seguir estudiando', persona.leGustariaEstudiar);
        this.drawCertificados(doc, persona.certificadoPrimaria, persona.certificadoSecundaria, persona.certificadoBachillerato);
        this.drawCampo(doc, 'Nombre del plantel', persona.nombrePlantel);
        this.drawCampo(doc, 'Dirección del plantel', persona.direccionPlantel);
        this.drawCampo(doc, 'Fecha de término', persona.fechaTerminoPlantel);
        doc.moveDown(0.3);
 
        // ─── III. LABORAL ────────────────────────────────────
        this.drawSeccionHeader(doc, 'III. LABORAL');
        this.drawCampo(doc, 'Trabaja formalmente', persona.trabajaFormal);
        if (persona.trabajaFormal === 'Sí' || persona.trabajaFormal === 'Si') {
          this.drawCampo(doc, 'Funciones', persona.funcionesTrabajo, true);
        }
        this.drawCampo(doc, 'Le gustaría cambiar de trabajo', persona.leGustariaCambiarTrabajo);
        this.drawCampo(doc, 'Sabe algún oficio', persona.sabeOficio);
        this.drawCampo(doc, 'Le gustaría aprender alguno', persona.leGustariaAprenderOficio);
        doc.moveDown(0.3);
 
        // ─── IV. SALUD ───────────────────────────────────────
        this.drawSeccionHeader(doc, 'IV. SALUD');
        this.drawCampo(doc, 'Padece alguna enfermedad', persona.padecimientoEnfermedad);
        this.drawCampo(doc, 'Servicio de salud', persona.servicioSalud);
        this.drawCampo(doc, 'Cuenta con tratamiento', persona.cuentaTratamiento);
        this.drawCampo(doc, 'Enfermedad de transmisión sexual', persona.enfermedadTransmisionSexual);
        this.drawCampo(doc, 'Necesita lentes', persona.necesitaLentes);
        this.drawCampo(doc, 'Atención psicológica reciente', persona.atencionPsicologica);
        doc.moveDown(0.3);
 
        // ─── V. CONTACTOS ────────────────────────────────────
        this.drawSeccionHeader(doc, 'V. CONTACTOS DE EMERGENCIA');
        this.drawCampo(doc, 'Contacto 1 — Nombre', persona.contacto1Nombre);
        this.drawCampo(doc, 'Contacto 1 — Relación', persona.contacto1Relacion);
        this.drawCampo(doc, 'Contacto 1 — Teléfono', persona.contacto1Telefono);
        this.drawCampo(doc, 'Contacto 2 — Nombre', persona.contacto2Nombre);
        this.drawCampo(doc, 'Contacto 2 — Relación', persona.contacto2Relacion);
        this.drawCampo(doc, 'Contacto 2 — Teléfono', persona.contacto2Telefono);
 
        doc.end();
      } catch (error: any) {
        reject(new InternalServerErrorException(`Error generando PDF: ${error.message}`));
      }
    });
  }
 
  async uploadFile(
    buffer: Buffer,
    filename: string,
    folderId: string,
  ): Promise<{ driveFileId: string; urlArchivo: string }> {
    if (!this.drive) return { driveFileId: 'DRIVE_DISABLED', urlArchivo: 'DRIVE_DISABLED' };
 
    try {
      const file = await this.drive.files.create({
        requestBody: { name: filename, parents: [folderId] },
        media: { mimeType: 'application/pdf', body: Readable.from(buffer) },
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });
 
      this.logger.log(`Archivo subido: ${filename} (ID: ${file.data.id})`);
      return { driveFileId: file.data.id!, urlArchivo: file.data.webViewLink! };
    } catch (error: any) {
      this.logger.error(`Error subiendo archivo a Drive: ${error.message}`);
      throw new InternalServerErrorException(`Error al subir archivo a Drive: ${error.message}`);
    }
  }
 
  async createPersonFolderWithPDF(persona: PersonaData): Promise<{
    folioNumber: number;
    folderName: string;
    folderId: string;
    driveFileId: string;
    urlArchivo: string;
  }> {
    if (!this.drive) throw new InternalServerErrorException('Google Drive no está disponible');
 
    try {
      const folioNumber = await this.getNextFolioNumber();
      const folderName = `${String(folioNumber).padStart(3, '0')} - ${persona.nombre}`;
      const folderId = await this.getOrCreateFolder(folderName);
      const pdfBuffer = await this.generatePersonPDF(persona, folioNumber);
      const filename = `${String(folioNumber).padStart(3, '0')}_${persona.nombre.replace(/\s+/g, '_')}.pdf`;
      const { driveFileId, urlArchivo } = await this.uploadFile(pdfBuffer, filename, folderId);
 
      this.logger.log(`Carpeta y PDF creados: ${folderName}`);
      return { folioNumber, folderName, folderId, driveFileId, urlArchivo };
    } catch (error: any) {
      this.logger.error(`Error en createPersonFolderWithPDF: ${error.message}`);
      throw error;
    }
  }
}
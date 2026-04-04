import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

const PDFDocument = require('pdfkit');

interface PersonaData {
  id: string;
  nombre: string;
  edad?: string;
  fechaNacimiento?: string;
  curp?: string;
  lugarOrigen?: string;
  motivoIngreso?: string;
  religion?: string;
  sabeLeerEscribir?: string;
  gradoMaximoEstudios?: string;
  trabajaFormal?: string;
  funcionesTrabajo?: string;
  sabeOficio?: string;
  padecimientoEnfermedad?: string;
  servicioSalud?: string;
  atencionPsicologica?: string;
  contacto1Nombre?: string;
  contacto1Relacion?: string;
  contacto1Telefono?: string;
  contacto2Nombre?: string;
  contacto2Relacion?: string;
  contacto2Telefono?: string;
}

@Injectable()
export class VoluntariosGoogleDriveService {
  private readonly logger = new Logger(VoluntariosGoogleDriveService.name);
  private drive: drive_v3.Drive | null = null;
  private rootFolderId: string | null = null;

  private normalizeFolderId(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();

    const folderMatch = trimmed.match(/(?:\/folders\/|id=)([a-zA-Z0-9_-]+)/i);
    if (folderMatch?.[1]) {
      return folderMatch[1];
    }

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
      this.logger.warn('Credenciales OAuth2 de Google Drive incompletas para Voluntarios. La integración será desactivada.');
      this.logger.debug(`ClientId: ${!!clientId}, ClientSecret: ${!!clientSecret}, Token: ${!!refreshToken}, FolderId: ${!!this.rootFolderId}`);
      return;
    }

    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      this.logger.log('Google Drive Service (Voluntarios) inicializado con éxito.');
    } catch (error: any) {
      this.logger.error(`Error al inicializar Google Drive Service (Voluntarios): ${error.message}`);
    }
  }

  /**
   * Obtiene o crea una carpeta por nombre dentro de una carpeta padre.
   */
  async getOrCreateFolder(name: string, parentId?: string): Promise<string> {
    if (!this.drive) return 'DRIVE_DISABLED';
    const parent = this.normalizeFolderId(parentId) || this.rootFolderId;

    if (!parent) {
      throw new InternalServerErrorException(
        'No se pudo resolver la carpeta padre de Google Drive para Voluntarios',
      );
    }

    try {
      // 1. Buscar si ya existe
      const res = await this.drive.files.list({
        q: `name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and '${parent}' in parents and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id!;
      }

      // 2. Crear si no existe
      const folderMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parent],
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
        supportsAllDrives: true,
      });

      this.logger.log(`Carpeta de voluntario creada: ${name} (ID: ${folder.data.id})`);
      return folder.data.id!;
    } catch (error: any) {
      this.logger.error(`Error en getOrCreateFolder (${name}): ${error.message}`);
      throw new InternalServerErrorException(`Error al gestionar carpeta de voluntario en Drive: ${error.message}`);
    }
  }

  /**
   * Cuenta las carpetas existentes en el root para asignar el siguiente número.
   */
  async getNextFolioNumber(): Promise<number> {
    if (!this.drive) return 1;

    try {
      const res = await this.drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${this.rootFolderId}' in parents and trashed = false`,
        fields: 'files(name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        pageSize: 1000, // Obtener máximo de carpetas
      });

      if (!res.data.files || res.data.files.length === 0) {
        return 1;
      }

      // Extraer números de las carpetas y obtener el máximo
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

  /**
   * Genera un PDF con los datos de la persona.
   */
  private generatePersonPDF(persona: PersonaData, folioNumber: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const buffers: Buffer[] = [];
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        // Encabezado
        doc.fontSize(20).font('Helvetica-Bold').text('FICHA DE VOLUNTARIO', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown();

        // Número de registro y nombre
        doc.fontSize(14).font('Helvetica-Bold').text(`Folio: ${folioNumber}`);
        doc.fontSize(14).font('Helvetica-Bold').text(`Nombre: ${persona.nombre || 'N/A'}`);
        doc.moveDown();

        // I. DATOS PERSONALES
        doc.fontSize(12).font('Helvetica-Bold').text('I. DATOS PERSONALES');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Edad: ${persona.edad || 'N/A'}`);
        doc.text(`Fecha de Nacimiento: ${persona.fechaNacimiento || 'N/A'}`);
        doc.text(`CURP: ${persona.curp || 'N/A'}`);
        doc.text(`Lugar de Origen: ${persona.lugarOrigen || 'N/A'}`);
        doc.text(`Religión: ${persona.religion || 'N/A'}`);
        doc.text(`Motivo de Ingreso: ${persona.motivoIngreso || 'N/A'}`);
        doc.moveDown();

        // II. ESCOLARIDAD
        doc.fontSize(12).font('Helvetica-Bold').text('II. ESCOLARIDAD');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Sabe Leer y Escribir: ${persona.sabeLeerEscribir || 'N/A'}`);
        doc.text(`Grado Máximo de Estudios: ${persona.gradoMaximoEstudios || 'N/A'}`);
        doc.moveDown();

        // III. INFORMACIÓN LABORAL
        doc.fontSize(12).font('Helvetica-Bold').text('III. INFORMACIÓN LABORAL');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Trabaja Formalmente: ${persona.trabajaFormal || 'N/A'}`);
        doc.text(`Funciones de Trabajo: ${persona.funcionesTrabajo || 'N/A'}`);
        doc.text(`Sabe Oficio: ${persona.sabeOficio || 'N/A'}`);
        doc.moveDown();

        // IV. SALUD
        doc.fontSize(12).font('Helvetica-Bold').text('IV. INFORMACIÓN DE SALUD');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Padecimiento/Enfermedad: ${persona.padecimientoEnfermedad || 'N/A'}`);
        doc.text(`Servicio de Salud: ${persona.servicioSalud || 'N/A'}`);
        doc.text(`Requiere Atención Psicológica: ${persona.atencionPsicologica || 'N/A'}`);
        doc.moveDown();

        // V. CONTACTOS
        doc.fontSize(12).font('Helvetica-Bold').text('V. CONTACTOS DE EMERGENCIA');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Contacto 1: ${persona.contacto1Nombre || 'N/A'}`);
        doc.text(`  Relación: ${persona.contacto1Relacion || 'N/A'}`);
        doc.text(`  Teléfono: ${persona.contacto1Telefono || 'N/A'}`);
        doc.text(`Contacto 2: ${persona.contacto2Nombre || 'N/A'}`);
        doc.text(`  Relación: ${persona.contacto2Relacion || 'N/A'}`);
        doc.text(`  Teléfono: ${persona.contacto2Telefono || 'N/A'}`);

        doc.end();
      } catch (error: any) {
        reject(new InternalServerErrorException(`Error generando PDF: ${error.message}`));
      }
    });
  }

  /**
   * Sube un buffer como PDF a una carpeta específica. Retorna ID y URL pública.
   */
  async uploadFile(buffer: Buffer, filename: string, folderId: string): Promise<{ driveFileId: string; urlArchivo: string }> {
    if (!this.drive) return { driveFileId: 'DRIVE_DISABLED', urlArchivo: 'DRIVE_DISABLED' };

    try {
      const fileMetadata = {
        name: filename,
        parents: [folderId],
      };

      const media = {
        mimeType: 'application/pdf',
        body: Readable.from(buffer),
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });

      this.logger.log(`Archivo subido: ${filename} (ID: ${file.data.id})`);
      return {
        driveFileId: file.data.id!,
        urlArchivo: file.data.webViewLink!,
      };
    } catch (error: any) {
      this.logger.error(`Error subiendo archivo a Drive: ${error.message}`);
      throw new InternalServerErrorException(`Error al subir archivo a Drive: ${error.message}`);
    }
  }

  /**
   * Función principal: Crea carpeta con número, genera PDF y lo sube.
   * Retorna la información de la carpeta y el archivo creado.
   */
  async createPersonFolderWithPDF(
    persona: PersonaData,
  ): Promise<{
    folioNumber: number;
    folderName: string;
    folderId: string;
    driveFileId: string;
    urlArchivo: string;
  }> {
    if (!this.drive) {
      throw new InternalServerErrorException('Google Drive no está disponible');
    }

    try {
      // 1. Obtener el siguiente número de folio
      const folioNumber = await this.getNextFolioNumber();

      // 2. Crear nombre de carpeta: "001 - Nombre de la Persona"
      const folderName = `${String(folioNumber).padStart(3, '0')} - ${persona.nombre}`;

      // 3. Crear o obtener la carpeta
      const folderId = await this.getOrCreateFolder(folderName);

      // 4. Generar PDF con los datos de la persona
      const pdfBuffer = await this.generatePersonPDF(persona, folioNumber);

      // 5. Subir el PDF a la carpeta
      const filename = `${folioNumber}_${persona.nombre.replace(/\s+/g, '_')}.pdf`;
      const { driveFileId, urlArchivo } = await this.uploadFile(pdfBuffer, filename, folderId);

      this.logger.log(`Carpeta de voluntario y PDF creados exitosamente: ${folderName}`);

      return {
        folioNumber,
        folderName,
        folderId,
        driveFileId,
        urlArchivo,
      };
    } catch (error: any) {
      this.logger.error(`Error en createPersonFolderWithPDF: ${error.message}`);
      throw error;
    }
  }
}

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class CivicoGoogleDriveService {
  private readonly logger = new Logger(CivicoGoogleDriveService.name);
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
      this.configService.get<string>('CIVICO_DRIVE_FOLDER_ID'),
    );

    if (!clientId || !clientSecret || !refreshToken || !this.rootFolderId) {
      this.logger.warn('Credenciales OAuth2 de Google Drive incompletas. La integración será desactivada.');
      this.logger.debug(`ClientId: ${!!clientId}, ClientSecret: ${!!clientSecret}, Token: ${!!refreshToken}, FolderId: ${!!this.rootFolderId}`);
      return;
    }

    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      this.logger.log('Google Drive Service (OAuth2) inicializado con éxito.');
    } catch (error: any) {
      this.logger.error(`Error al inicializar el cliente de Drive OAuth2: ${error.message}`);
    }
  }

  // Busca la carpeta por nombre en el padre indicado, o la crea si no existe.
  async getOrCreateFolder(name: string, parentId?: string): Promise<string> {
    if (!this.drive) return 'DRIVE_DISABLED';
    const parent = this.normalizeFolderId(parentId) || this.rootFolderId;

    if (!parent) {
      throw new InternalServerErrorException(
        'No se pudo resolver la carpeta padre de Google Drive',
      );
    }

    try {
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

      this.logger.log(`Created new Drive folder: ${name} (ID: ${folder.data.id})`);
      return folder.data.id!;
    } catch (error: any) {
      this.logger.error(`Error in getOrCreateFolder (${name}): ${error.message}`);
      throw new InternalServerErrorException(`Error al gestionar carpeta en Drive: ${error.message}`);
    }
  }

  // Sube un buffer como PDF a una carpeta de Drive. Retorna el ID y la URL del archivo.
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

      return {
        driveFileId: file.data.id!,
        urlArchivo: file.data.webViewLink!,
      };
    } catch (error: any) {
      this.logger.error(`Error uploading file to Drive: ${error.message}`);
      throw new InternalServerErrorException(`Error al subir archivo a Drive: ${error.message}`);
    }
  }

  // Sobreescribe el contenido de un archivo existente en Drive.
  async updateFile(driveFileId: string, buffer: Buffer): Promise<{ urlArchivo: string }> {
    if (!this.drive) return { urlArchivo: 'DRIVE_DISABLED' };

    try {
      const media = {
        mimeType: 'application/pdf',
        body: Readable.from(buffer),
      };

      const file = await this.drive.files.update({
        fileId: driveFileId,
        media: media,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });

      return {
        urlArchivo: file.data.webViewLink!,
      };
    } catch (error: any) {
      this.logger.error(`Error updating file in Drive: ${error.message}`);
      throw new InternalServerErrorException(`Error al actualizar archivo en Drive: ${error.message}`);
    }
  }

  // Retorna (o crea) la subcarpeta para documentos firmados dentro de la carpeta del beneficiario.
  async getSignedDocsFolder(beneficiaryFolderId: string): Promise<string> {
    return this.getOrCreateFolder('Documentos Firmados', beneficiaryFolderId);
  }

  // Verifica si un archivo o carpeta de Drive existe y si está en la papelera.
  async getFileMetadata(fileId: string): Promise<{ trashed: boolean; mimeType?: string } | null> {
    if (!this.drive) return null;
    try {
      const res = await this.drive.files.get({
        fileId,
        fields: 'trashed, mimeType',
        supportsAllDrives: true,
      });
      return { trashed: !!res.data.trashed, mimeType: res.data.mimeType || undefined };
    } catch (error: any) {
      if (error.code === 404) return null;
      this.logger.error(`Error getting metadata for ${fileId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Descarga el contenido de un archivo desde Drive como Buffer.
   */
  async getFileContent(fileId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (!this.drive) throw new InternalServerErrorException('Google Drive está desactivado.');
    try {
      const res = await this.drive.files.get(
        { fileId, alt: 'media', supportsAllDrives: true },
        { responseType: 'arraybuffer' },
      );
      
      const meta = await this.getFileMetadata(fileId);
      const mimeType = meta?.mimeType || 'image/jpeg';

      return { 
        buffer: Buffer.from(res.data as ArrayBuffer),
        mimeType
      };
    } catch (error: any) {
      this.logger.error(`Error al descargar archivo ${fileId} de Drive: ${error.message}`);
      throw new InternalServerErrorException(`No se pudo obtener el contenido del archivo de Drive: ${error.message}`);
    }
  }

  /**
   * Extrae el ID de un archivo desde una URL de Google Drive.
   * Soporta formatos: /file/d/ID/view, id=ID, o el ID directo.
   */
  extractFileId(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // Caso 1: /file/d/FILE_ID/...
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileMatch?.[1]) return fileMatch[1];

    // Caso 2: /open?id=FILE_ID o /uc?id=FILE_ID o similar
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idMatch?.[1]) return idMatch[1];

    // Caso 3: d/FILE_ID (sin /file/)
    const shortenMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (shortenMatch?.[1]) return shortenMatch[1];

    // Caso 4: Es el ID directo (alfanumérico de longitud Drive)
    if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed) && !trimmed.startsWith('http')) {
      return trimmed;
    }

    return null;
  }
}

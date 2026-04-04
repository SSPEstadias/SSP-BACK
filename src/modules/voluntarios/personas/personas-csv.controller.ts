import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { PersonasCsvService } from './personas-csv.service';
 
@Controller('voluntarios/personas/csv')
export class PersonasCsvController {
  constructor(private readonly personasCsvService: PersonasCsvService) {}
 
  // GET /voluntarios/personas/csv/template
  // Descarga el archivo CSV con encabezados y fila de ejemplo
  @Get('template')
  downloadTemplate(@Res() res: Response) {
    const buffer = this.personasCsvService.generateCsvTemplate();
 
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="formato_voluntarios.csv"');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
 
  // POST /voluntarios/personas/csv/upload
  // Recibe el CSV y crea los registros en la BD
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // guardamos en memoria, no en disco
      limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv)$/i)) {
          return cb(new BadRequestException('Solo se permiten archivos .csv'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
 
    const resultado = await this.personasCsvService.uploadCsv(file.buffer);
 
    return {
      mensaje: `Carga completada. ${resultado.creados} de ${resultado.total} personas creadas.`,
      total: resultado.total,
      creados: resultado.creados,
      fallidos: resultado.errores.length,
      errores: resultado.errores,
    };
  }
}
 
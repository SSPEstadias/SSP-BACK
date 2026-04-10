import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { PersonasCsvService } from './personas-csv.service';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';

@Controller('voluntarios/personas/csv')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.TALLERISTA)
export class PersonasCsvController {
  constructor(private readonly personasCsvService: PersonasCsvService) {}

  // GET /voluntarios/personas/csv/template
  // Sirve el archivo CSV estático desde la carpeta templates/
 @Get('template')
downloadTemplate(@Res() res: Response) {
 const filePath = join(__dirname, 'templates', 'formato_voluntarios.csv');

  if (!existsSync(filePath)) {
    throw new NotFoundException('Archivo de plantilla no encontrado');
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="formato_voluntarios.csv"');
  createReadStream(filePath).pipe(res);
}

  // POST /voluntarios/personas/csv/upload
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
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
      mensaje: `Carga completada. ${resultado.creados} creadas, ${resultado.actualizados} actualizadas, ${resultado.errores.length} errores.`,
      total: resultado.total,
      creados: resultado.creados,
      actualizados: resultado.actualizados,
      fallidos: resultado.errores.length,
      errores: resultado.errores,
    };
  }
}

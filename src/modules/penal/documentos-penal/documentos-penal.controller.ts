import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentosPenalService } from './documentos-penal.service';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { RolUsuario } from '../../../shared/users/entities/user.entity';

@Controller('penal/documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentosPenalController {
  constructor(
    private readonly documentosPenalService: DocumentosPenalService,
  ) {}

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get('caratula/:expedienteId/pdf')
  async descargarCaratulaPdf(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentosPenalService.generarCaratulaPenalPdf(expedienteId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get('ficha-seguimiento/:id/pdf')
  async descargarFichaSeguimientoPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentosPenalService.generarFichaSeguimientoPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get('nota-evolucion-psicologica/:id/pdf')
  async descargarNotaEvolucionPsicologicaPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentosPenalService.generarNotaEvolucionPsicologicaPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.PSICOLOGO,
    RolUsuario.TRABAJO_SOCIAL,
    RolUsuario.GUIA,
  )
  @Get('plan-trabajo/:id/pdf')
  async descargarPlanTrabajoPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.documentosPenalService.generarPlanTrabajoPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}

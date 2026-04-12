import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  ParseUUIDPipe,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Express } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiProduces,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { DocumentosService } from './documentos.service';
import { OficioGenerado } from '../oficios/oficio-generado.entity';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

// Envía el buffer PDF como descarga HTTP (attachment = Swagger y navegadores lo descargan).
function sendPdf(res: Response, buffer: Buffer, filename: string): void {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buffer.length,
  });
  res.status(HttpStatus.OK).end(buffer);
}

// Schema de respuesta reutilizable: PDF descargable.
const PDF_RESPONSE = {
  status: 200,
  description: 'PDF generado y disponible para descargar',
  content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
};

@ApiTags('📄 Documentos PDF')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  // ── GET /civico/documentos/oficio-incorporacion/:expedienteId ────
  @Get('oficio-incorporacion/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({ summary: 'Generar Oficio de Incorporación al Programa en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async oficioIncorporacion(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarOficioIncorporacion(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/oficio-conclusion/:expedienteId ────────
  @Get('oficio-conclusion/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({ summary: 'Generar Oficio de Conclusión del Programa en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async oficioConclusion(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarOficioConclusion(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/informe-baja/:expedienteId ─────────────
  @Get('informe-baja/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Coordinador')
  @ApiOperation({ summary: 'Generar Informe de Baja Definitiva en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async informeBaja(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarInformeBaja(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/ficha-incidencias/:expedienteId ────────
  @Get('ficha-incidencias/:expedienteId')
  @Roles('Admin', 'Guia', 'TrabajoSocial', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Generar Ficha Técnica de Incidencias en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async fichaIncidencias(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarFichaIncidencias(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/f3-plan-trabajo/:expedienteId ──────────
  @Get('f3-plan-trabajo/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Generar F3 — Plan de Trabajo Individual en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async f3PlanTrabajo(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarF3PlanTrabajo(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/f4-cedula-inicial/:expedienteId ────────
  @Get('f4-cedula-inicial/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Generar F4 — Cédula Inicial de Seguimiento en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async f4CedulaInicial(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarF4CedulaInicial(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/plan-vida/:expedienteId ────────────────
  @Get('plan-vida/:expedienteId')
  @Roles('Admin', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Generar Plan de Vida Individualizada (desde F1) en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async planVida(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarPlanVida(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/nota-evolucion/:expedienteId ──────────
  @Get('nota-evolucion/:expedienteId')
  @Roles('Admin', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Generar Nota de Evolución Psicológica (Historial de Sesiones) en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async notaEvolucion(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarNotaEvolucion(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/lista-asistencia/:expedienteId ──────────
  @Get('lista-asistencia/:expedienteId')
  @Roles('Admin', 'Guia', 'TrabajoSocial', 'Psicologo', 'Tallerista', 'Coordinador')
  @ApiOperation({ summary: 'Generar Plantilla de Lista de Asistencia (para imprimir y llenar a mano)' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async listaAsistenciaBeneficiario(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarTemplateListaAsistencia(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── POST /civico/documentos/lista-asistencia ──────────────────────
  @Post('lista-asistencia')
  @Roles('Admin', 'Guia', 'Tallerista', 'Coordinador')
  @ApiOperation({ summary: 'Registrar Asistencia en Bitácora y Generar PDF' })
  @ApiProduces('application/pdf')
  @ApiBody({
    description: 'Datos para la asistencia. Si incluyes expedienteId, se guarda en BD y Drive.',
    examples: {
      'Asistencia con Registro': {
        value: {
          expedienteId:    EXAMPLE_EXP_ID,
          fecha:           '2026-04-06',
          horasCubiertas:  4,
          asistencia:      'PRESENTE',
          horario:         '08:00 - 12:00',
          sede:            'Sede Central',
          actividadNombre: 'Taller de Valores',
          observaciones:   'Asistencia puntual.',
          evidenciaUrl:    'https://drive.google.com/file/d/ejemplo_drive/view',
        },
      },
    },
  })
  @ApiResponse(PDF_RESPONSE)
  async listaAsistencia(
    @Body() datos: any,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.procesarAsistenciaHibrida(datos, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/reporte-semanal/:expedienteId ──────────
  @Get('reporte-semanal/:expedienteId')
  @Roles('Admin', 'Guia', 'TrabajoSocial', 'Psicologo', 'Coordinador')
  @ApiOperation({ summary: 'Generar Plantilla de Reporte Semanal (para imprimir)' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse(PDF_RESPONSE)
  async reporteSemanalBeneficiario(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.generarTemplateReporteSemanal(expedienteId, userId);
    sendPdf(res, buffer, filename);
  }

  // ── POST /civico/documentos/reporte-semanal ───────────────────────
  @Post('reporte-semanal')
  @Roles('Admin', 'Guia', 'Coordinador')
  @ApiOperation({ summary: 'Registrar Reporte Semanal en Bitácora y Generar PDF' })
  @ApiProduces('application/pdf')
  @ApiBody({
    description: 'Datos del reporte semanal. Si incluyes expedienteId, se guarda en Drive y Bitácora.',
    examples: {
      'Reporte con Registro': {
        value: {
          expedienteId:     EXAMPLE_EXP_ID,
          semanaNumero:     1,
          fechaInicio:      '2026-04-06',
          fechaFin:         '2026-04-10',
          observaciones:    'Semana productiva, completó todas sus actividades.',
          renglones: [
            { fecha: '2026-04-06', asistencia: 'P', descripcion: 'Taller de Mediación' },
            { fecha: '2026-04-07', asistencia: 'P', descripcion: 'Servicio Comunitario' },
            { fecha: '2026-04-08', asistencia: 'P', descripcion: 'Sesión Psicológica' }
          ]
        },
      },
    },
  })
  @ApiResponse(PDF_RESPONSE)
  async reporteSemanal(
    @Body() datos: any,
    @CurrentUser() userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.documentosService.procesarReporteSemanalHibrido(datos, userId);
    sendPdf(res, buffer, filename);
  }

  // ── GET /civico/documentos/historial/:expedienteId ────────────────
  @Get('historial/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Psicologo', 'Guia', 'Tallerista', 'Coordinador')
  @ApiOperation({ summary: 'Obtener el historial de oficios y documentos generados para un expediente' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiResponse({
    status: 200,
    description: 'Lista de oficios encontrados',
    type: [OficioGenerado],
  })
  async historial(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
  ): Promise<OficioGenerado[]> {
    return this.documentosService.listarOficiosBeneficiario(expedienteId);
  }

  // ── POST /civico/documentos/generar-custom ────────────────────────
  @Post('generar-custom')
  @Roles('Admin', 'Coordinador')
  @ApiOperation({
    summary: 'Generar cualquier template HBS con datos personalizados (Admin)',
    description: 'Útil para pruebas y documentos ad-hoc sin un expediente ligado.',
  })
  @ApiBody({
    description: 'Nombre del template y datos del contexto',
    examples: {
      'Ejemplo genérico': {
        value: {
          template: 'oficio_incorporacion',
          datos: {
            folioOficio: 'OFC-INCORP-2026-001',
            nombreBeneficiario: 'JUAN PÉREZ LÓPEZ',
            curp: 'PELJ000101HOFRNN01',
          },
        },
      },
    },
  })
  @ApiResponse(PDF_RESPONSE)
  async generarCustom(
    @Body() body: { template: string; datos: Record<string, unknown> },
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarPdf(body.template, body.datos ?? {});
    sendPdf(res, buffer, `${body.template}_${Date.now()}.pdf`);
  }

  // ── GET /civico/documentos/expediente/:id/paquete-forms ───────────
  @Get('expediente/:id/paquete-forms')
  @Roles('Admin', 'TrabajoSocial', 'Psicologo', 'Coordinador')
  @ApiOperation({ 
    summary: 'Obtener URLs de todos los documentos para el Google Form Federal',
    description: 'Consolida enlaces de Drive de F3, F4, Plan Vida, Reporte Semanal y los escaneos firmados.' 
  })
  @ApiParam({ name: 'id', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
  async obtenerPaqueteFederal(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentosService.obtenerPaqueteFederal(id);
  }

  // ── POST /civico/documentos/subir-escaneado ───────────────────────
  @Post('subir-escaneado')
  @Roles('Admin', 'TrabajoSocial', 'Coordinador')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Subir versión escaneada/firmada de un oficio (Canalización o Incorporación)',
    description: 'Se guarda en la subcarpeta "Documentos Firmados" de Drive y actualiza el expediente.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
        tipo: { type: 'string', enum: ['CANALIZACION', 'INCORPORACION'], example: 'CANALIZACION' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async subirEscaneado(
    @Body('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Body('tipo') tipo: 'CANALIZACION' | 'INCORPORACION',
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: number,
  ) {
    return this.documentosService.subirDocumentoEscaneado(expedienteId, tipo, file, userId);
  }
}

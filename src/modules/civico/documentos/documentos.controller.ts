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
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { DocumentosService } from './documentos.service';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

/** Envía el buffer PDF como respuesta HTTP con los headers adecuados. */
function sendPdf(res: Response, buffer: Buffer, filename: string): void {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${filename}"`,
    'Content-Length': buffer.length,
  });
  res.status(HttpStatus.OK).end(buffer);
}

@ApiTags('📄 Documentos PDF')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  // ── GET /civico/documentos/oficio-incorporacion/:expedienteId ────
  @Get('oficio-incorporacion/:expedienteId')
  @Roles('Admin', 'TrabajoSocial')
  @ApiOperation({ summary: 'Generar Oficio de Incorporación al Programa en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async oficioIncorporacion(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarOficioIncorporacion(expedienteId);
    sendPdf(res, buffer, `oficio_incorporacion_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/oficio-conclusion/:expedienteId ────────
  @Get('oficio-conclusion/:expedienteId')
  @Roles('Admin', 'TrabajoSocial')
  @ApiOperation({ summary: 'Generar Oficio de Conclusión del Programa en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async oficioConclusion(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarOficioConclusion(expedienteId);
    sendPdf(res, buffer, `oficio_conclusion_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/informe-baja/:expedienteId ─────────────
  @Get('informe-baja/:expedienteId')
  @Roles('Admin', 'TrabajoSocial')
  @ApiOperation({ summary: 'Generar Informe de Baja Definitiva en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async informeBaja(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarInformeBaja(expedienteId);
    sendPdf(res, buffer, `informe_baja_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/hoja-presentacion/:expedienteId ────────
  @Get('hoja-presentacion/:expedienteId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  @ApiOperation({ summary: 'Generar Hoja de Presentación al Programa en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async hojaPresentacion(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarHojaPresentacion(expedienteId);
    sendPdf(res, buffer, `hoja_presentacion_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/ficha-incidencias/:expedienteId ────────
  @Get('ficha-incidencias/:expedienteId')
  @Roles('Admin', 'Guia', 'TrabajoSocial', 'Psicologo')
  @ApiOperation({ summary: 'Generar Ficha Técnica de Incidencias en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async fichaIncidencias(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarFichaIncidencias(expedienteId);
    sendPdf(res, buffer, `ficha_incidencias_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/f3-plan-trabajo/:expedienteId ──────────
  @Get('f3-plan-trabajo/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Psicologo')
  @ApiOperation({ summary: 'Generar F3 — Plan de Trabajo Individual en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async f3PlanTrabajo(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarF3PlanTrabajo(expedienteId);
    sendPdf(res, buffer, `f3_plan_trabajo_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/f4-cedula-inicial/:expedienteId ────────
  @Get('f4-cedula-inicial/:expedienteId')
  @Roles('Admin', 'TrabajoSocial', 'Psicologo')
  @ApiOperation({ summary: 'Generar F4 — Cédula Inicial de Seguimiento en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async f4CedulaInicial(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarF4CedulaInicial(expedienteId);
    sendPdf(res, buffer, `f4_cedula_inicial_${expedienteId}.pdf`);
  }

  // ── GET /civico/documentos/plan-vida/:expedienteId ────────────────
  @Get('plan-vida/:expedienteId')
  @Roles('Admin', 'Psicologo')
  @ApiOperation({ summary: 'Generar Plan de Vida Individualizada (desde F1) en PDF' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente cívico', example: EXAMPLE_EXP_ID })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async planVida(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarPlanVida(expedienteId);
    sendPdf(res, buffer, `plan_vida_${expedienteId}.pdf`);
  }

  // ── POST /civico/documentos/lista-asistencia ──────────────────────
  @Post('lista-asistencia')
  @Roles('Admin', 'Guia')
  @ApiOperation({ summary: 'Generar Lista de Asistencia en PDF (datos ad-hoc)' })
  @ApiProduces('application/pdf')
  @ApiBody({
    description: 'Datos para la lista de asistencia',
    examples: {
      'Lista de asistencia ejemplo': {
        value: {
          nombreActividad: 'Taller de Liderazgo y Valores',
          fecha: '07/04/2026',
          horario: '08:00 – 12:00 hrs',
          nombreGuia: 'MARIO JIMÉNEZ SÁNCHEZ',
          lugar: 'Centro Comunitario "La Paz", Col. Centro, Oaxaca',
          totalBeneficiarios: 3,
          horasPorJornada: 4,
          categoriaActividad: 'PSICOSOCIAL',
          filasVacias: 5,
          beneficiarios: [
            {
              nombre: 'JUAN PÉREZ LÓPEZ',
              curp: 'PELJ000101HOFRNN01',
              folio: 'OAX-2026-001',
              horasSentencia: 40,
              horasAcum: 12,
              asistencia: 'P',
              horasCubiertas: 4,
              incidencia: '',
            },
            {
              nombre: 'CARLOS MENDOZA RUIZ',
              curp: 'MERC010315HOCRRL05',
              folio: 'OAX-2026-002',
              horasSentencia: 24,
              horasAcum: 8,
              asistencia: 'P',
              horasCubiertas: 4,
              incidencia: '',
            },
            {
              nombre: 'SOFÍA TORRES GARCÍA',
              curp: 'TOGS020720MOCRRF03',
              folio: 'OAX-2026-003',
              horasSentencia: 32,
              horasAcum: 0,
              asistencia: 'F',
              horasCubiertas: 0,
              incidencia: 'FALTA_INJUSTIFICADA',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async listaAsistencia(
    @Body() datos: Record<string, unknown>,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarListaAsistencia(datos);
    sendPdf(res, buffer, `lista_asistencia_${Date.now()}.pdf`);
  }

  // ── POST /civico/documentos/reporte-semanal ───────────────────────
  @Post('reporte-semanal')
  @Roles('Admin', 'Guia')
  @ApiOperation({ summary: 'Generar Reporte Semanal de Guía en PDF (datos ad-hoc)' })
  @ApiProduces('application/pdf')
  @ApiBody({
    description: 'Datos para el reporte semanal',
    examples: {
      'Reporte semana 5': {
        value: {
          nombreGuia: 'MARIO JIMÉNEZ SÁNCHEZ',
          semanaNumero: 5,
          fechaInicio: '07/04/2026',
          fechaFin: '11/04/2026',
          actividades: 'Taller de Liderazgo, Limpieza de Parque',
          observaciones:
            'Semana sin incidencias mayores. Un beneficiario faltó sin justificación el jueves.',
          totalHorasSemana: 15,
          beneficiarios: [
            {
              nombre: 'JUAN PÉREZ LÓPEZ',
              curp: 'PELJ000101HOFRNN01',
              lun: 'P',
              mar: 'P',
              mie: 'P',
              jue: 'P',
              vie: 'P',
              horasSemana: 20,
              horasAcum: 32,
              incidencias: '',
            },
            {
              nombre: 'CARLOS MENDOZA RUIZ',
              curp: 'MERC010315HOCRRL05',
              lun: 'P',
              mar: 'PP',
              mie: 'P',
              jue: 'F',
              vie: 'P',
              horasSemana: 14,
              horasAcum: 22,
              incidencias: 'FALTA_INJUSTIFICADA',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async reporteSemanal(
    @Body() datos: Record<string, unknown>,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarReporteSemanal(datos);
    sendPdf(res, buffer, `reporte_semanal_${Date.now()}.pdf`);
  }

  // ── POST /civico/documentos/generar-custom ────────────────────────
  @Post('generar-custom')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Generar cualquier template HBS con datos personalizados (Admin)',
    description:
      'Permite a un administrador generar cualquier template disponible pasando el nombre y los datos del contexto. ' +
      'Útil para pruebas y documentos ad-hoc.',
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
            causaPenal: '2026-CV-00001',
            horasSentencia: 40,
            folioIncorporacion: 'OAX-2026-001',
            fechaIncorporacion: '01/04/2026',
            juzgadoNombre: 'Juzgado Cívico N° 1 Oaxaca',
            juezNombre: 'LIC. CARLOS RAMÍREZ MORENO',
            juezCargo: 'Juez Cívico',
            oficioCanalizacion: 'JC-2026-0045',
            delitoImputado: 'Escándalo en la vía pública',
            modalidadFalta: 'Administrativo — Leve',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async generarCustom(
    @Body() body: { template: string; datos: Record<string, unknown> },
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.documentosService.generarPdf(body.template, body.datos ?? {});
    sendPdf(res, buffer, `${body.template}_${Date.now()}.pdf`);
  }
}
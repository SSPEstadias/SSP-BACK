import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { F1EntrevistaService } from './f1-entrevista.service';
import { CreateEntrevistaClinicaDto } from './dto/create-entrevista-clinica.dto';
import { UpdateEntrevistaClinicaDto } from './dto/update-entrevista-clinica.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { FormStatusEnum } from '../enums/civico.enums';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

@ApiTags('📝 F1 — Entrevista')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/f1')
export class F1EntrevistaController {
  constructor(private readonly service: F1EntrevistaService) {}

  // POST /civico/f1
  @Post()
  @Roles('Admin', 'Psicologo')
  @ApiOperation({
    summary: '(Fase 4) Crear Entrevista Clínica Inicial (F1) — RF-004',
    description:
      'Registra el diagnóstico psicológico inicial del beneficiario. ' +
      'Solo el **Psicólogo** y el **Admin** pueden crear este registro. ' +
      'Los bloques JSONB (`generalesEntrevista`, `situacionJuridicaF1`, `nucleoFamiliarPrimario`, `sustanciasDetalle`, `perfilPersonal`, `saludDetalle`, `proyectoVida`) ' +
      'permiten estructurar datos específicos según el formato del formulario físico. ' +
      'Este formulario **debe completarse** (`estatusF1: "COMPLETADO"`) antes de crear el F3 (RF-008).',
  })
  @ApiBody({
    description: 'Datos de la entrevista clínica. Usa los bloques JSONB para el detalle clínico.',
    examples: {
      'Escenario 1 — Con consumo de sustancias y riesgo (caso complejo)': {
        summary: '(Fase 4) Beneficiario con consumo de sustancias y necesidad de apoyo',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          psicologoId: 2,
          fechaEntrevista: '2025-03-28',
          consentimientoInformado: true,
          riesgoSuicida: false,
          consumeSustancias: true,
          padeceEnfermedadCronica: false,
          necesitaApoyoPsicologico: true,
          motivoConsulta: 'Remitido por el juzgado cívico por alteración al orden público bajo influencia del alcohol.',
          antecedentesClinicos: 'Sin antecedentes psiquiátricos. Historial de consumo moderado de alcohol.',
          examenMental: 'Orientado en las tres esferas, lenguaje coherente, afecto levemente ansioso, sin alucinaciones.',
          impresionDiagnostica: 'Consumo problemático de alcohol (F10.1 CIE-10). Se recomienda tratamiento reeducativo.',
          generalesEntrevista: { escolaridad: 'Licenciatura incompleta', ocupacion: 'Estudiante', estadoCivil: 'Soltero' },
          situacionJuridicaF1: { causa: 'CP-2025-AX-099', juzgado: 'JCM-01', horasSentencia: 48 },
          nucleoFamiliarPrimario: { conviveConPadres: true, relacionFamiliar: 'Buena', numHijos: 0 },
          sustanciasDetalle: { tipo: 'Alcohol', frecuencia: 'Fines de semana', edadInicio: 18, tratamientoPrevio: false },
          perfilPersonal: { hobbies: 'Fútbol, música', metas: 'Terminar la carrera de Ingeniería' },
          saludDetalle: { enfermedadesCronicas: 'Ninguna', medicamentos: 'Ninguno' },
          proyectoVida: { personal: 'Obtener el título universitario', familiar: 'Apoyar a sus padres', social: 'Servir a la comunidad' },
          estatusF1: 'COMPLETADO',
        },
      },
      'Escenario 2 — Sin consumo de sustancias (caso leve)': {
        summary: '(Fase 4) Beneficiario sin problemáticas clínicas graves',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          psicologoId: 2,
          fechaEntrevista: '2025-03-28',
          consentimientoInformado: true,
          riesgoSuicida: false,
          consumeSustancias: false,
          padeceEnfermedadCronica: false,
          necesitaApoyoPsicologico: false,
          motivoConsulta: 'Primer contacto derivado del juzgado cívico por riña en vía pública.',
          antecedentesClinicos: 'Sin antecedentes de relevancia clínica.',
          examenMental: 'Orientado, lenguaje fluido, afecto eutímico, sin alteraciones perceptuales.',
          impresionDiagnostica: 'Sin trastorno evidente. Conducta impulsiva situacional. Buen pronóstico.',
          generalesEntrevista: { escolaridad: 'Preparatoria terminada', ocupacion: 'Empleado', estadoCivil: 'Casado' },
          situacionJuridicaF1: { causa: 'CP-2025-AX-099', juzgado: 'JCM-01', horasSentencia: 24 },
          nucleoFamiliarPrimario: { conviveConConyuge: true, relacionFamiliar: 'Estable', numHijos: 1 },
          sustanciasDetalle: null,
          proyectoVida: { personal: 'Crecer en mi trabajo', familiar: 'Dar buen ejemplo a mi hijo' },
          estatusF1: 'COMPLETADO',
        },
      },
      'Escenario 3 — En proceso (sesión inicial, se completará después)': {
        summary: 'Primera sesión incompleta — continuar en PATCH',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          psicologoId: 2,
          fechaEntrevista: '2025-03-28',
          consentimientoInformado: true,
          motivoConsulta: 'Primera sesión de inducción al programa.',
          estatusF1: 'EN_PROCESO',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'F1 creado. El `idUUID` puede usarse para actualizar la entrevista con PATCH.',
    schema: {
      type: 'object',
      properties: {
        idUUID: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
        psicologoId: { type: 'number', example: 2 },
        estatusF1: { type: 'string', example: 'COMPLETADO', enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'] },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Ya existe un F1 para este expediente (relación 1:1)' })
  create(@Body() dto: CreateEntrevistaClinicaDto) {
    return this.service.create(dto);
  }

  // GET /civico/f1/expediente/:expedienteId
  @Get('expediente/:expedienteId')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  @ApiOperation({ summary: 'Obtener F1 por expediente' })
  @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
  @ApiResponse({ status: 200, description: 'Entrevista clínica del expediente' })
  @ApiResponse({ status: 404, description: 'No existe F1 para ese expediente' })
  findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
    return this.service.findByExpediente(expedienteId);
  }

  // GET /civico/f1/:id
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial')
  @ApiOperation({ summary: 'Obtener F1 por UUID del registro' })
  @ApiParam({ name: 'id', description: 'UUID del registro F1', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Entrevista clínica encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // PATCH /civico/f1/:id
  @Patch(':id')
  @Roles('Admin', 'Psicologo')
  @ApiOperation({ summary: 'Actualizar datos de la entrevista clínica F1' })
  @ApiParam({ name: 'id', description: 'UUID del registro F1' })
  @ApiBody({
    description: 'Campos a actualizar. Solo incluye los que cambien.',
    examples: {
      'Completar impresión diagnóstica': {
        value: {
          impresionDiagnostica: 'Trastorno adaptativo leve (F43.2 CIE-10). Buen pronóstico con intervención breve.',
          examenMental: 'Orientado en esferas, afecto eutímico, juicio y raciocinio conservados.',
          estatusF1: 'COMPLETADO',
        },
      },
      'Agregar proyecto de vida': {
        value: {
          proyectoVida: { personal: 'Terminar la universidad', familiar: 'Mejorar relación con sus padres' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'F1 actualizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEntrevistaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  // PATCH /civico/f1/:id/estatus
  @Patch(':id/estatus')
  @Roles('Admin', 'Psicologo')
  @ApiOperation({
    summary: 'Cambiar estatus del F1',
    description:
      '⚠️ Establece el estatus del formulario. Para desbloquear el F3 (RF-008), el F1 **debe estar en `COMPLETADO`**.',
  })
  @ApiParam({ name: 'id', description: 'UUID del registro F1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estatus: {
          type: 'string',
          enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CERRADO'],
          example: 'COMPLETADO',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Estatus actualizado' })
  cambiarEstatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estatus') estatus: FormStatusEnum,
  ) {
    return this.service.cambiarEstatus(id, estatus);
  }
}


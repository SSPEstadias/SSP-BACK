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
    description:
      'Datos de la entrevista clínica. Los bloques JSONB reflejan exactamente las secciones del formulario físico F1. ' +
      'Sección II → `generalesEntrevista`. ' +
      'Sección III → `situacionJuridicaF1`. ' +
      'Sección IV → `nucleoFamiliarPrimario` (con array `miembros[]`). ' +
      'Sección V → `sustanciasDetalle` (6 preguntas completas). ' +
      'Secciones VI+VII+VIII+IX → `perfilPersonal` (emociones, destrezas, deportes, tiempo_libre). ' +
      'Sección X → `saludDetalle`. ' +
      'Sección XI → `proyectoVida` (personal, familiar, laboral, espiritual, academico, social).',
    examples: {
      '✅ Formulario Completo — Todas las secciones del F1 físico': {
        summary: '(Fase 4) Ejemplo completo que refleja el 100% del formulario físico',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          psicologoId: 2,
          fechaEntrevista: '2026-04-07',
          consentimientoInformado: true,
          riesgoSuicida: false,
          consumeSustancias: true,
          padeceEnfermedadCronica: false,
          necesitaApoyoPsicologico: true,
          motivoConsulta: 'Remitido por el Juzgado Cívico Municipal por alteración al orden público.',
          antecedentesClinicos: 'Sin antecedentes psiquiátricos. Historial de consumo moderado de alcohol los fines de semana.',
          examenMental: 'Orientado en las tres esferas, lenguaje coherente, afecto levemente ansioso, sin alucinaciones ni ideación suicida.',
          impresionDiagnostica: 'Consumo problemático de alcohol (F10.1 CIE-10). Se recomienda tratamiento reeducativo y participación en el programa cívico.',
          // ── Sección II: Generales (institucion_canaliza y datos de expediente) ──
          generalesEntrevista: {
            institucion_canaliza: 'Municipio de Oaxaca de Juárez',
            sobrenombre: 'El Güero',
            originario: 'Oaxaca de Juárez, Oax.',
            escolaridad: 'Licenciatura incompleta',
            estado_civil: 'Soltero',
            nacionalidad: 'Mexicana',
            lengua_indigena: 'Ninguna',
            religion: 'Católica',
            ocupacion: 'Estudiante universitario',
          },
          // ── Sección III: Situación Jurídica ──
          situacionJuridicaF1: {
            fecha_detencion: '2026-04-01',
            falta_civica: 'Alteración al orden público en vía pública',
            relato_hechos: 'El beneficiario fue detenido en estado de ebriedad en la Plaza de la Danza, alterando el orden público y provocando escándalo.',
          },
          // ── Sección IV: Núcleo Familiar Primario (tabla: nombre, parentesco, edad, edo.civil, escolaridad, ocupacion) ──
          nucleoFamiliarPrimario: {
            miembros: [
              { nombre: 'María López Pérez',   parentesco: 'Madre',   edad: 50, estado_civil: 'Casada',  escolaridad: 'Secundaria',   ocupacion: 'Ama de casa' },
              { nombre: 'José Ramírez García', parentesco: 'Padre',   edad: 53, estado_civil: 'Casado',  escolaridad: 'Preparatoria', ocupacion: 'Comerciante' },
              { nombre: 'Ana Ramírez López',   parentesco: 'Hermana', edad: 22, estado_civil: 'Soltera', escolaridad: 'Licenciatura', ocupacion: 'Empleada' },
            ],
            observacion_relacion: 'Dinámica familiar funcional. Red de apoyo sólida. Comunicación positiva entre los miembros.',
          },
          // ── Sección V: Uso de Sustancias (6 preguntas del formulario físico) ──
          sustanciasDetalle: {
            especifique: 'Alcohol (cerveza). Consumo ocasional los fines de semana.',   // Pregunta 1
            ha_recibido_terapias: false,                                                 // Pregunta 2
            donde_terapias: '',
            // Pregunta 3: necesita_apoyo_psicologico se captura en el campo booleano directo
            asiste_grupos_aa: false,                                                    // Pregunta 4
            donde_grupos_aa: '',
            ha_estado_rehabilitacion: false,                                             // Pregunta 5
            donde_rehabilitacion: '',
            periodo_rehabilitacion: '',
            pertenece_grupo_cultural: false,                                             // Pregunta 6
            cual_grupo: '',
          },
          // ── Secciones VI + VII + VIII + IX → perfilPersonal ──────────
          perfilPersonal: {
            // VI. Emociones
            emociones: {
              miedo:    'Perder a mi familia y no poder concluir mis estudios.',
              alegria:  'Pasar tiempo con mis amigos y practicar deportes.',
              enojo:    'La injusticia y el trato irrespetuoso hacia los demás.',
              tristeza: 'La situación en la que me encuentro y haber fallado a mi familia.',
              amor:     'Mi familia, especialmente mis padres que me apoyan incondicionalmente.',
            },
            // VII. Destrezas o Habilidades
            destrezas: 'Programación web, diseño gráfico, habilidades de comunicación y trabajo en equipo.',
            // VIII. Deportes
            deportes: 'Fútbol soccer y natación. Practica fútbol en equipo los domingos.',
            // IX. Tiempo Libre
            tiempo_libre: 'Escucha música, lee libros de superación personal y convive con su familia.',
          },
          // ── Sección X: Salud ──
          saludDetalle: {
            descripcion_enfermedad: 'Ninguna enfermedad crónica degenerativa diagnosticada.',
            lleva_tratamiento: false,
            indique_tratamiento: '',
          },
          // ── Sección XI: Proyecto de Vida (6 dimensiones del formulario) ──
          proyectoVida: {
            personal:   'Desarrollar mayor disciplina y autocontrol emocional para evitar situaciones conflictivas.',
            familiar:   'Fortalecer los lazos familiares y ser un ejemplo positivo para mis hermanos.',
            laboral:    'Concluir la carrera de Ingeniería en Sistemas y conseguir empleo en el sector tecnológico.',
            espiritual: 'Retomar la práctica religiosa familiar y encontrar equilibrio emocional.',
            academico:  'Regularizar materias reprobadas y mejorar mi promedio universitario.',
            social:     'Participar en actividades comunitarias y contribuir al bienestar de mi colonia.',
          },
          estatusF1: 'COMPLETADO',
        },
      },
      'Caso Leve — Sin consumo de sustancias': {
        summary: '(Fase 4) Beneficiario sin problemáticas clínicas graves',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          psicologoId: 2,
          fechaEntrevista: '2026-04-07',
          consentimientoInformado: true,
          riesgoSuicida: false,
          consumeSustancias: false,
          padeceEnfermedadCronica: false,
          necesitaApoyoPsicologico: false,
          motivoConsulta: 'Primer contacto derivado del juzgado cívico por riña en vía pública.',
          antecedentesClinicos: 'Sin antecedentes de relevancia clínica.',
          examenMental: 'Orientado, lenguaje fluido, afecto eutímico, sin alteraciones perceptuales.',
          impresionDiagnostica: 'Sin trastorno evidente. Conducta impulsiva situacional. Buen pronóstico.',
          generalesEntrevista: { institucion_canaliza: 'Municipio de Oaxaca', escolaridad: 'Preparatoria', estado_civil: 'Casado', ocupacion: 'Empleado' },
          situacionJuridicaF1: { falta_civica: 'Riña en vía pública', relato_hechos: 'Involucrado en discusión que escaló a riña frente a su domicilio.' },
          nucleoFamiliarPrimario: {
            miembros: [
              { nombre: 'Laura García Vásquez',  parentesco: 'Cónyuge', edad: 29, estado_civil: 'Casada', escolaridad: 'Licenciatura', ocupacion: 'Maestra' },
              { nombre: 'Rodrigo Sánchez García', parentesco: 'Hijo',    edad: 3,  estado_civil: 'N/A',    escolaridad: 'N/A',          ocupacion: 'N/A' },
            ],
            observacion_relacion: 'Familia nuclear funcional. Cónyuge comprometida con el proceso.',
          },
          sustanciasDetalle: null,
          perfilPersonal: {
            emociones: { miedo: 'Perder el trabajo.', alegria: 'Mi familia.', enojo: 'La injusticia.', tristeza: 'Situación actual.', amor: 'Mi esposa e hijo.' },
            destrezas: 'Electricidad, carpintería básica.',
            deportes: 'Fútbol los fines de semana.',
            tiempo_libre: 'Convivencia familiar, ver películas.',
          },
          saludDetalle: { descripcion_enfermedad: 'Ninguna.', lleva_tratamiento: false, indique_tratamiento: '' },
          proyectoVida: { personal: 'Mejorar control de impulsos.', familiar: 'Dar buen ejemplo a mi hijo.', laboral: 'Crecer en mi empresa.', espiritual: '', academico: '', social: '' },
          estatusF1: 'COMPLETADO',
        },
      },
      'Sesión Inicial — En Proceso': {
        summary: 'Primera sesión incompleta — continuar en PATCH',
        value: {
          expedienteId: EXAMPLE_EXP_ID,
          psicologoId: 2,
          fechaEntrevista: '2026-04-07',
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


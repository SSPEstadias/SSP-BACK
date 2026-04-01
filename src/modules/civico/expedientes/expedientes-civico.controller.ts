import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { ExpedientesCivicoService } from './expedientes-civico.service';
import { CreateExpedienteCivicoDto } from './dto/create-expediente-civico.dto';
import { UpdateExpedienteCivicoDto } from './dto/update-expediente-civico.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';

const EXPEDIENTE_EXAMPLE = {
  idUUID: '8c478ea9-fbcb-452d-90f6-e689a2590fd6',
  beneficiarioId: 1,
  esActivo: true,
  numReincidencia: 0,
  curp: 'LEOY880101HDFRRN01',
  fechaNacimiento: '1988-01-01',
  genero: 'M',
  aliasSobrenombre: null,
  originario: 'Ciudad de México',
  domicilioCompleto: 'Calle Reforma 123, Col. Centro, CDMX',
  municipio: 'Cuauhtémoc',
  codigoPostal: '06600',
  telefonoContacto: '5551234567',
  escolaridadActual: 'Licenciatura incompleta',
  estadoCivil: 'Soltero',
  ocupacionActual: 'Estudiante',
  nacionalidad: 'Mexicana',
  lenguaIndigena: null,
  religion: null,
  contactosFamiliares: {
    madre: { nombre: 'María López García', telefono: '5559876543' },
    padre: { nombre: 'José León Reyes', telefono: '5551112233' },
  },
  folioExpediente: 'EXP-CIV-2025-0001',
  numJuzgadoCivico: 'JCM-01',
  juezControl: 'Lic. Roberto Gómez Martínez',
  generoJuez: 'M',
  oficioCanalizacion: 'OFC-CAN-2025-055',
  causaPenal: 'CP-2025-AX-099',
  delitoImputado: 'Alteración al orden público (Art. 23 LJCA)',
  agraviado: 'Ciudadanía en general',
  fechaDetencion: '2025-03-20',
  modalidadFalta: 'Falta administrativa por alteración al orden público',
  horasSentencia: 48,
  diasAsignadosJuzgado: ['2025-04-07', '2025-04-09', '2025-04-11'],
  horasPorDia: 4,
  fechaInicioBeneficio: '2025-04-01',
  fechaTerminoBeneficio: '2025-06-30',
  fechaOficioCanalizacion: '2025-03-28',
  estatusProceso: 'INDUCCION',
  avanceHoras: 0,
  driveFolderId: null,
  creadoEn: '2025-03-28T10:00:00.000Z',
};

@ApiTags('📁 Expedientes Cívico')
@ApiBearerAuth('JWT-Auth')

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('civico/expedientes')
export class ExpedientesCivicoController {
  constructor(private readonly service: ExpedientesCivicoService) {}

  // ── POST /civico/expedientes ──────────────────────────────────────
  @Post()
  @Roles('Admin')
  @ApiOperation({
    summary: '(Fase 2) Crear un nuevo expediente cívico [Solo Admin]',
    description:
      'Crea la **carátula central** que vincula el beneficiario con todo el expediente de Justicia Cívica. ' +
      'El UUID retornado (`idUUID`) se usa como `expedienteId` en **todas** las fases siguientes (F1–F5, Bitácora, Incidencias, Documentos). ' +
      'El campo `estatusProceso` inicia en `INDUCCION` y avanza automáticamente según las formas completadas.',
  })
  @ApiBody({
    description: 'Datos completos del expediente. Los campos marcados con * son obligatorios.',
    examples: {
      'Expediente Completo (caso típico — Yahir Leon)': {
        summary: '(Fase 2) Expediente cívico con todos los campos',
        value: {
          beneficiarioId: 1,
          curp: 'LEOY880101HDFRRN01',
          fechaNacimiento: '1988-01-01',
          genero: 'M',
          domicilioCompleto: 'Calle Reforma 123, Col. Centro, CDMX',
          municipio: 'Cuauhtémoc',
          codigoPostal: '06600',
          telefonoContacto: '5551234567',
          escolaridadActual: 'Licenciatura incompleta',
          estadoCivil: 'Soltero',
          ocupacionActual: 'Estudiante',
          nacionalidad: 'Mexicana',
          contactosFamiliares: {
            madre: { nombre: 'María López García', telefono: '5559876543' },
            padre: { nombre: 'José León Reyes', telefono: '5551112233' },
          },
          folioExpediente: 'EXP-CIV-2025-0001',
          numJuzgadoCivico: 'JCM-01',
          juezControl: 'Lic. Roberto Gómez Martínez',
          generoJuez: 'M',
          causaPenal: 'CP-2025-AX-099',
          delitoImputado: 'Alteración al orden público (Art. 23 LJCA)',
          agraviado: 'Ciudadanía en general',
          fechaDetencion: '2025-03-20',
          modalidadFalta: 'Falta administrativa por alteración al orden público',
          horasSentencia: 48,
          diasAsignadosJuzgado: ['2025-04-07', '2025-04-09', '2025-04-11'],
          horasPorDia: 4,
          fechaInicioBeneficio: '2025-04-01',
          fechaTerminoBeneficio: '2025-06-30',
          fechaOficioCanalizacion: '2025-03-28',
        },
      },
      'Expediente Mínimo (campos obligatorios únicamente)': {
        summary: 'Solo campos requeridos',
        value: {
          beneficiarioId: 1,
          fechaNacimiento: '1988-01-01',
          domicilioCompleto: 'Calle Reforma 123, Col. Centro, CDMX',
          folioExpediente: 'EXP-CIV-2025-0002',
          causaPenal: 'CP-2025-BX-001',
          horasSentencia: 24,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Expediente creado. Guarda el campo `idUUID` — es el `expedienteId` para F1, F2, F3, F4, F5, Bitácora, Incidencias y Documentos.',
    schema: { type: 'object', example: EXPEDIENTE_EXAMPLE },
  })
  @ApiResponse({ status: 409, description: '`folioExpediente` ya existe o beneficiario ya tiene expediente activo' })
  @ApiResponse({ status: 404, description: 'beneficiarioId no encontrado' })
  create(@Body() dto: CreateExpedienteCivicoDto) {
    return this.service.create(dto);
  }

  // ── GET /civico/expedientes/caratulas ─────────────────────────────
  @Get('caratulas')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({
    summary: 'Listar carátulas resumidas de todos los expedientes',
    description: 'Vista de la pantalla principal — incluye datos del beneficiario via JOIN. Todos los roles pueden ver la lista.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de carátulas con nombre del beneficiario, folio, estatus y avance de horas',
  })
  findAllCaratulas() {
    return this.service.findAllCaratulas();
  }

  // ── GET /civico/expedientes ───────────────────────────────────────
  @Get()
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Listar todos los expedientes (datos completos, uso interno/Admin)' })
  @ApiResponse({ status: 200, description: 'Lista completa de expedientes cívicos' })
  findAll() {
    return this.service.findAll();
  }

  // ── GET /civico/expedientes/curp/:curp ────────────────────────────
  @Get('curp/:curp')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Buscar expediente por CURP del beneficiario' })
  @ApiParam({ name: 'curp', description: 'CURP completa del beneficiario (18 caracteres)', example: 'LEOY880101HDFRRN01' })
  @ApiResponse({ status: 200, description: 'Expediente encontrado', schema: { type: 'object', example: EXPEDIENTE_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'No existe expediente para esa CURP' })
  findByCurp(@Param('curp') curp: string) {
    return this.service.findByCurp(curp);
  }

  // ── GET /civico/expedientes/:id/caratula ──────────────────────────
  @Get(':id/caratula')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Obtener carátula de un expediente (header del perfil del beneficiario)' })
  @ApiParam({ name: 'id', description: 'UUID del expediente', example: '8c478ea9-fbcb-452d-90f6-e689a2590fd6' })
  @ApiResponse({ status: 200, description: 'Carátula del expediente con datos del beneficiario' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  findCaratula(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findCaratula(id);
  }

  // ── GET /civico/expedientes/:id ───────────────────────────────────
  @Get(':id')
  @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia')
  @ApiOperation({ summary: 'Obtener expediente completo por UUID' })
  @ApiParam({ name: 'id', description: 'UUID del expediente', example: '8c478ea9-fbcb-452d-90f6-e689a2590fd6' })
  @ApiResponse({ status: 200, description: 'Expediente completo', schema: { type: 'object', example: EXPEDIENTE_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // ── PATCH /civico/expedientes/:id ─────────────────────────────────
  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar datos del expediente [Solo Admin]' })
  @ApiParam({ name: 'id', description: 'UUID del expediente', example: '8c478ea9-fbcb-452d-90f6-e689a2590fd6' })
  @ApiBody({
    description: 'Solo incluye los campos a actualizar',
    examples: {
      'Cambiar estatus a GRADUADO': {
        value: { estatusProceso: 'GRADUADO' },
      },
      'Actualizar datos de contacto': {
        value: {
          telefonoContacto: '5557654321',
          domicilioCompleto: 'Av. Insurgentes Sur 456, Col. Del Valle, CDMX',
        },
      },
      'Agregar días asignados por el juzgado': {
        value: {
          diasAsignadosJuzgado: ['2025-05-05', '2025-05-07', '2025-05-09'],
          horasPorDia: 4,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Expediente actualizado', schema: { type: 'object', example: EXPEDIENTE_EXAMPLE } })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpedienteCivicoDto,
  ) {
    return this.service.update(id, dto);
  }

  // ── DELETE /civico/expedientes/:id ────────────────────────────────
  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Desactivar un expediente [Solo Admin]',
    description: 'Marca el expediente como inactivo (`esActivo = false`). No elimina el registro físicamente.',
  })
  @ApiParam({ name: 'id', description: 'UUID del expediente', example: '8c478ea9-fbcb-452d-90f6-e689a2590fd6' })
  @ApiResponse({ status: 200, description: 'Expediente desactivado correctamente' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deactivate(id);
  }
}
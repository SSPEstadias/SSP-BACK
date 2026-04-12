import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    ParseUUIDPipe,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { OficiosService } from './oficios.service';
  import { CreateOficioGeneradoDto } from './dto/create-oficio-generado.dto';
  import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
  import { TipoDocumentoEnum } from '../enums/civico.enums';
  import { RolesGuard } from '../../../shared/common/guards/roles.guard';
  import { Roles } from '../../../shared/common/decorators/roles.decorator';
  import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

const EXAMPLE_EXP_ID = '8c478ea9-fbcb-452d-90f6-e689a2590fd6';

  @ApiTags('📨 Oficios')
@ApiBearerAuth('JWT-Auth')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Controller('civico/oficios')
  export class OficiosController {
    constructor(private readonly service: OficiosService) {}
  
    // POST /civico/oficios
    @Post()
    @Roles('Admin', 'Guia', 'Coordinador')
    @ApiOperation({
      summary: '(Fase 10) Registrar un documento/oficio generado — RF-015',
      description:
        'Registra el metadato de un documento PDF ya generado (mediante el módulo de Documentos PDF). ' +
        'Los documentos se generan con `GET /civico/documentos/{tipo}/{expedienteId}` y se registran aquí para auditoría. ' +
        '\n\n**Tipos de documento disponibles:**\n' +
        '- `OFICIO_CANALIZACION` — Oficio del juzgado que canaliza al beneficiario\n' +
        '- `OFICIO_INCORPORACION` — Confirmación de incorporación al programa\n' +
        '- `OFICIO_CONCLUSION` — Oficio de conclusión satisfactoria\n' +
        '- `INFORME_INCIDENCIAS` — Reporte de incidencias para el juzgado\n' +
        '- `OFICIO_BAJA_DEFINITIVA` — Baja por acumulación de incidencias\n' +
        '- `F3_PLAN_TRABAJO` — Plan de trabajo individual\n' +
        '- `F4_CEDULA_INICIAL` — Cédula inicial de seguimiento\n' +
        '- `LISTA_ASISTENCIA` — Lista de asistencia semanal\n' +
        '- `REPORTE_SEMANAL_GUIA` — Reporte semanal del guía\n' +
        '- `NOTA_EVOLUCION_PSICOLOGICA` — Nota de evolución psicológica',
    })
    @ApiBody({
      description: 'Metadatos del documento generado.',
      examples: {
        'Oficio de Incorporación': {
          summary: 'Registrar Oficio de Incorporación',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            generadoPorId: 1,
            tipoDocumento: 'OFICIO_INCORPORACION',
            folioOficio: 'OFC-INCORP-2025-0001',
            nombreArchivoFederal: 'LEOY880101HDFRRN01_OFICIO_INCORPORACION.pdf',
            urlArchivo: 'https://drive.google.com/file/d/ejemplo123abc',
            esModificacion: false,
          },
        },
        'Oficio de Conclusión (graduación)': {
          summary: 'Registrar Oficio de Conclusión',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            generadoPorId: 1,
            tipoDocumento: 'OFICIO_CONCLUSION',
            folioOficio: 'OFC-CONCL-2025-0042',
            nombreArchivoFederal: 'LEOY880101HDFRRN01_OFICIO_CONCLUSION.pdf',
            urlArchivo: 'https://drive.google.com/file/d/ejemplo456def',
            esModificacion: false,
          },
        },
        'Oficio de Baja Definitiva (por incidencias)': {
          summary: 'Registrar Oficio de Baja por acumulación de incidencias',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            generadoPorId: 1,
            tipoDocumento: 'OFICIO_BAJA_DEFINITIVA',
            folioOficio: 'OFC-BAJA-2025-0007',
            nombreArchivoFederal: 'LEOY880101HDFRRN01_OFICIO_BAJA_DEFINITIVA.pdf',
            urlArchivo: 'https://drive.google.com/file/d/ejemplo789ghi',
            esModificacion: false,
          },
        },
        'Oficio de Canalización (externo del juzgado)': {
          summary: 'Registrar Oficio de Canalización (viene del juzgado)',
          value: {
            expedienteId: EXAMPLE_EXP_ID,
            generadoPorId: 1,
            tipoDocumento: 'OFICIO_CANALIZACION',
            folioOficio: 'JCM-01-CAN-2025-055',
            nombreArchivoFederal: 'LEOY880101HDFRRN01_OFICIO_CANALIZACION.pdf',
            urlArchivo: 'https://drive.google.com/file/d/ejemploJuzgado',
            esExterno: true,
            esModificacion: false,
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'Oficio registrado correctamente.',
      schema: {
        type: 'object',
        properties: {
          idUUID: { type: 'string', format: 'uuid', example: 'b8c9d0e1-f2a3-4567-1234-678901234567' },
          expedienteId: { type: 'string', format: 'uuid', example: EXAMPLE_EXP_ID },
          tipoDocumento: { type: 'string', example: 'OFICIO_INCORPORACION' },
          folioOficio: { type: 'string', example: 'OFC-INCORP-2025-0001' },
          urlArchivo: { type: 'string', example: 'https://drive.google.com/file/d/ejemplo123abc' },
          fechaGeneracion: { type: 'string', format: 'date-time', example: '2025-04-01T10:00:00.000Z' },
        },
      },
    })
    @ApiResponse({ status: 409, description: '`folioOficio` ya existe en el sistema' })
    create(@Body() dto: CreateOficioGeneradoDto) {
      return this.service.create(dto);
    }
  
    // GET /civico/oficios/expediente/:expedienteId
    @Get('expediente/:expedienteId')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia', 'Coordinador')
    @ApiOperation({ summary: 'Listar todos los oficios de un expediente' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiResponse({ status: 200, description: 'Lista de oficios generados para el expediente' })
    findByExpediente(@Param('expedienteId', ParseUUIDPipe) expedienteId: string) {
      return this.service.findByExpediente(expedienteId);
    }
  
    // GET /civico/oficios/expediente/:expedienteId?tipo=OFICIO_CONCLUSION
    @Get('expediente/:expedienteId/tipo')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia', 'Coordinador')
    @ApiOperation({ summary: 'Filtrar oficios de un expediente por tipo de documento' })
    @ApiParam({ name: 'expedienteId', description: 'UUID del expediente', example: EXAMPLE_EXP_ID })
    @ApiQuery({
      name: 'tipo',
      enum: [
        'OFICIO_CANALIZACION', 'OFICIO_INCORPORACION', 'OFICIO_CONCLUSION',
        'INFORME_INCIDENCIAS', 'OFICIO_BAJA_DEFINITIVA', 'OFICIO_MODIFICACION_DIAS',
        'F3_PLAN_TRABAJO', 'F4_CEDULA_INICIAL', 'LISTA_ASISTENCIA',
        'REPORTE_SEMANAL_GUIA', 'HOJA_PRESENTACION', 'PLAN_VIDA', 'NOTA_EVOLUCION_PSICOLOGICA',
      ],
      example: 'OFICIO_CONCLUSION',
    })
    @ApiResponse({ status: 200, description: 'Lista de oficios filtrada por tipo' })
    findByTipo(
      @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
      @Query('tipo') tipo: TipoDocumentoEnum,
    ) {
      return this.service.findByTipo(expedienteId, tipo);
    }
  
    // GET /civico/oficios/folio/:folio
    @Get('folio/:folio')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia', 'Coordinador')
    @ApiOperation({ summary: 'Buscar un oficio por número de folio' })
    @ApiParam({ name: 'folio', description: 'Número de folio del oficio', example: 'OFC-INCORP-2025-0001' })
    @ApiResponse({ status: 200, description: 'Oficio encontrado por folio' })
    @ApiResponse({ status: 404, description: 'No existe oficio con ese folio' })
    findByFolio(@Param('folio') folio: string) {
      return this.service.findByFolio(folio);
    }
  
  
    // GET /civico/oficios/:id
    @Get(':id')
    @Roles('Admin', 'Psicologo', 'TrabajoSocial', 'Guia', 'Coordinador')
    @ApiOperation({ summary: 'Obtener un oficio por UUID' })
    @ApiParam({ name: 'id', description: 'UUID del registro de oficio', example: 'b8c9d0e1-f2a3-4567-1234-678901234567' })
    @ApiResponse({ status: 200, description: 'Oficio encontrado' })
    @ApiResponse({ status: 404, description: 'Oficio no encontrado' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.findOne(id);
    }
  }
import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { Persona } from './entities/persona.entity';
 
@Injectable()
export class PersonasCsvService {
  private readonly logger = new Logger(PersonasCsvService.name);
 
  // Encabezados exactos del CSV — mismo orden para template y para parseo
  static readonly CSV_HEADERS = [
    'nombre',
    'folio',
    'sobrenombre',
    'edad',
    'fechaNacimiento',
    'curp',
    'lugarOrigen',
    'motivoIngreso',
    'fechaInicioTratamiento',
    'fechaTerminoTratamiento',
    'religion',
    'practicaDeporte',
    'cualDeporte',
    'pasatiempo',
    'tieneActaNacimiento',
    'lugarNacimientoRegistro',
    'personasRegistraron',
    'sabeLeerEscribir',
    'gradoMaximoEstudios',
    'leGustariaEstudiar',
    'certificadoPrimaria',
    'certificadoSecundaria',
    'certificadoBachillerato',
    'nombrePlantel',
    'direccionPlantel',
    'fechaTerminoPlantel',
    'trabajaFormal',
    'funcionesTrabajo',
    'leGustariaCambiarTrabajo',
    'sabeOficio',
    'leGustariaAprenderOficio',
    'padecimientoEnfermedad',
    'servicioSalud',
    'cuentaTratamiento',
    'enfermedadTransmisionSexual',
    'necesitaLentes',
    'atencionPsicologica',
    'contacto1Nombre',
    'contacto1Relacion',
    'contacto1Telefono',
    'contacto2Nombre',
    'contacto2Relacion',
    'contacto2Telefono',
    'estado',
  ];
 
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}
 
  // ─── GENERAR TEMPLATE CSV ────────────────────────────────────
  generateCsvTemplate(): Buffer {
    // Fila de encabezados
    const headers = PersonasCsvService.CSV_HEADERS.join(',');
 
    // Fila de ejemplo para guiar al usuario
    const ejemplo = [
      'Juan Pérez López',   // nombre
      'VOL-001',             // folio
      'El Profe',            // sobrenombre
      '25',                  // edad
      '2000-01-15',          // fechaNacimiento (YYYY-MM-DD)
      'PELJ000115HOCRPN09',  // curp
      'Oaxaca, Oax.',        // lugarOrigen
      'Motivo de ingreso',   // motivoIngreso
      '2026-03-01',          // fechaInicioTratamiento
      '2026-06-01',          // fechaTerminoTratamiento
      'Católica',            // religion
      'Sí',                  // practicaDeporte
      'Fútbol',              // cualDeporte
      'Leer',                // pasatiempo
      'Sí',                  // tieneActaNacimiento
      'Oaxaca',              // lugarNacimientoRegistro
      'Padres',              // personasRegistraron
      'Sí',                  // sabeLeerEscribir
      'Secundaria',          // gradoMaximoEstudios
      'Sí',                  // leGustariaEstudiar
      'true',                // certificadoPrimaria (true/false)
      'false',               // certificadoSecundaria
      'false',               // certificadoBachillerato
      'Secundaria Técnica 5',// nombrePlantel
      'Calle Reforma 123',   // direccionPlantel
      '2018-07-15',          // fechaTerminoPlantel
      'No',                  // trabajaFormal
      '',                    // funcionesTrabajo
      'Sí',                  // leGustariaCambiarTrabajo
      'Carpintería',         // sabeOficio
      'Electricidad',        // leGustariaAprenderOficio
      'Ninguno',             // padecimientoEnfermedad
      'IMSS',                // servicioSalud
      'No',                  // cuentaTratamiento
      'No',                  // enfermedadTransmisionSexual
      'No',                  // necesitaLentes
      'No',                  // atencionPsicologica
      'María López',         // contacto1Nombre
      'Madre',               // contacto1Relacion
      '9511234567',          // contacto1Telefono
      'Carlos Pérez',        // contacto2Nombre
      'Padre',               // contacto2Relacion
      '9519876543',          // contacto2Telefono
      'Activo',              // estado
    ].join(',');
 
    const csv = `${headers}\n${ejemplo}\n`;
    return Buffer.from(csv, 'utf-8');
  }
 
  // ─── PARSEAR Y CARGAR CSV ────────────────────────────────────
  async uploadCsv(buffer: Buffer): Promise<{
    total: number;
    creados: number;
    errores: { fila: number; mensaje: string }[];
  }> {
    let rows: any[];
 
    // Parsear el CSV
    try {
      rows = parse(buffer, {
        columns: true,           // usa la primera fila como keys
        skip_empty_lines: true,
        trim: true,
        bom: true,               // maneja BOM de Excel
      });
    } catch (error: any) {
      throw new BadRequestException(`El archivo CSV no tiene un formato válido: ${error.message}`);
    }
 
    if (!rows || rows.length === 0) {
      throw new BadRequestException('El archivo CSV está vacío o solo contiene encabezados');
    }
 
    const errores: { fila: number; mensaje: string }[] = [];
    let creados = 0;
 
    for (let i = 0; i < rows.length; i++) {
      const fila = i + 2; // fila 1 = encabezados, fila 2 = primer dato
      const row = rows[i];
 
      // Validar campo obligatorio
      if (!row.nombre || row.nombre.trim() === '') {
        errores.push({ fila, mensaje: 'El campo "nombre" es obligatorio' });
        continue;
      }
 
      // Validar estado
      if (row.estado && !['Activo', 'Inactivo'].includes(row.estado)) {
        errores.push({ fila, mensaje: `Estado inválido: "${row.estado}". Use "Activo" o "Inactivo"` });
        continue;
      }
 
      // Validar fechas
      const camposFecha = [
        'fechaNacimiento',
        'fechaInicioTratamiento',
        'fechaTerminoTratamiento',
        'fechaTerminoPlantel',
      ];
 
      let fechaInvalida = false;
      for (const campo of camposFecha) {
        if (row[campo] && row[campo].trim() !== '') {
          const fecha = new Date(row[campo]);
          if (isNaN(fecha.getTime())) {
            errores.push({ fila, mensaje: `Fecha inválida en "${campo}": "${row[campo]}". Use el formato YYYY-MM-DD` });
            fechaInvalida = true;
            break;
          }
        }
      }
 
      if (fechaInvalida) continue;
 
      try {
        const persona = this.personaRepository.create({
          nombre: row.nombre.trim(),
          folio: row.folio || null,
          sobrenombre: row.sobrenombre || null,
          edad: row.edad || null,
          fechaNacimiento: row.fechaNacimiento || null,
          curp: row.curp || null,
          lugarOrigen: row.lugarOrigen || null,
          motivoIngreso: row.motivoIngreso || null,
          fechaInicioTratamiento: row.fechaInicioTratamiento || null,
          fechaTerminoTratamiento: row.fechaTerminoTratamiento || null,
          religion: row.religion || null,
          practicaDeporte: row.practicaDeporte || null,
          cualDeporte: row.cualDeporte || null,
          pasatiempo: row.pasatiempo || null,
          tieneActaNacimiento: row.tieneActaNacimiento || null,
          lugarNacimientoRegistro: row.lugarNacimientoRegistro || null,
          personasRegistraron: row.personasRegistraron || null,
          sabeLeerEscribir: row.sabeLeerEscribir || null,
          gradoMaximoEstudios: row.gradoMaximoEstudios || null,
          leGustariaEstudiar: row.leGustariaEstudiar || null,
          certificadoPrimaria: row.certificadoPrimaria === 'true',
          certificadoSecundaria: row.certificadoSecundaria === 'true',
          certificadoBachillerato: row.certificadoBachillerato === 'true',
          nombrePlantel: row.nombrePlantel || null,
          direccionPlantel: row.direccionPlantel || null,
          fechaTerminoPlantel: row.fechaTerminoPlantel || null,
          trabajaFormal: row.trabajaFormal || null,
          funcionesTrabajo: row.funcionesTrabajo || null,
          leGustariaCambiarTrabajo: row.leGustariaCambiarTrabajo || null,
          sabeOficio: row.sabeOficio || null,
          leGustariaAprenderOficio: row.leGustariaAprenderOficio || null,
          padecimientoEnfermedad: row.padecimientoEnfermedad || null,
          servicioSalud: row.servicioSalud || null,
          cuentaTratamiento: row.cuentaTratamiento || null,
          enfermedadTransmisionSexual: row.enfermedadTransmisionSexual || null,
          necesitaLentes: row.necesitaLentes || null,
          atencionPsicologica: row.atencionPsicologica || null,
          contacto1Nombre: row.contacto1Nombre || null,
          contacto1Relacion: row.contacto1Relacion || null,
          contacto1Telefono: row.contacto1Telefono || null,
          contacto2Nombre: row.contacto2Nombre || null,
          contacto2Relacion: row.contacto2Relacion || null,
          contacto2Telefono: row.contacto2Telefono || null,
          estado: (row.estado as 'Activo' | 'Inactivo') || 'Activo',
        });
 
        await this.personaRepository.save(persona);
        creados++;
        this.logger.log(`Fila ${fila}: Persona "${row.nombre}" creada correctamente`);
      } catch (error: any) {
        this.logger.error(`Error en fila ${fila}: ${error.message}`);
        errores.push({ fila, mensaje: `Error al guardar: ${error.message}` });
      }
    }
 
    return {
      total: rows.length,
      creados,
      errores,
    };
  }
}
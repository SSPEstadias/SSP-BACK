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

  // ─── CONVERTIR FECHA DD-MM-YYYY → YYYY-MM-DD ─────────────────
  // Excel modifica las fechas YYYY-MM-DD, por eso en el CSV se
  // usan DD-MM-YYYY que Excel no reconoce como fecha y no toca.
  // El back las convierte antes de guardar.
 private parseFecha(valor: string | undefined): string | null {
  if (!valor || valor.trim() === '') return null;

  const raw = valor.trim();

  // Acepta DD-MM-YYYY o DD/MM/YYYY
  const ddmmyyyy = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/;
  const matchDDMMYYYY = raw.match(ddmmyyyy);
  if (matchDDMMYYYY) {
    return `${matchDDMMYYYY[3]}-${matchDDMMYYYY[2]}-${matchDDMMYYYY[1]}`;
  }

  // Acepta YYYY-MM-DD o YYYY/MM/DD
  const yyyymmdd = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/;
  const matchYYYYMMDD = raw.match(yyyymmdd);
  if (matchYYYYMMDD) {
    return `${matchYYYYMMDD[1]}-${matchYYYYMMDD[2]}-${matchYYYYMMDD[3]}`;
  }

  return null;
}

  // ─── PARSEAR Y CARGAR CSV ────────────────────────────────────
  async uploadCsv(buffer: Buffer): Promise<{
    total: number;
    creados: number;
    actualizados: number;
    errores: { fila: number; mensaje: string }[];
  }> {
    let rows: any[];

    try {
      rows = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (error: any) {
      throw new BadRequestException(`El archivo CSV no tiene un formato válido: ${error.message}`);
    }

    if (!rows || rows.length === 0) {
      throw new BadRequestException('El archivo CSV está vacío o solo contiene encabezados');
    }

    const errores: { fila: number; mensaje: string }[] = [];
    let creados = 0;
    let actualizados = 0;

    for (let i = 0; i < rows.length; i++) {
      const fila = i + 2;
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

      // Validar y convertir fechas
      const camposFecha = [
        'fechaNacimiento',
        'fechaInicioTratamiento',
        'fechaTerminoTratamiento',
        'fechaTerminoPlantel',
      ];

      let fechaInvalida = false;
      for (const campo of camposFecha) {
        if (row[campo] && row[campo].trim() !== '') {
          const convertida = this.parseFecha(row[campo]);
          if (!convertida) {
            errores.push({
              fila,
              mensaje: `Fecha inválida en "${campo}": "${row[campo]}". Use el formato DD-MM-YYYY (ej: 15-01-2000)`,
            });
            fechaInvalida = true;
            break;
          }
          // Reemplazamos el valor del row con la fecha convertida
          row[campo] = convertida;
        }
      }

      if (fechaInvalida) continue;

      try {
        // ─── LÓGICA UPSERT POR FOLIO ─────────────────────────
        const datos = {
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
        };

        // Si tiene folio, buscar si ya existe
        if (datos.folio) {
          const existente = await this.personaRepository.findOne({
            where: { folio: datos.folio },
          });

          if (existente) {
            const updated = this.personaRepository.merge(existente, datos);
            await this.personaRepository.save(updated);
            actualizados++;
            this.logger.log(`Fila ${fila}: Persona con folio "${datos.folio}" actualizada`);
            continue;
          }
        }

        // No existe o no tiene folio — crear nueva
        const persona = this.personaRepository.create(datos);
        await this.personaRepository.save(persona);
        creados++;
        this.logger.log(`Fila ${fila}: Persona "${datos.nombre}" creada correctamente`);

      } catch (error: any) {
        this.logger.error(`Error en fila ${fila}: ${error.message}`);
        errores.push({ fila, mensaje: `Error al guardar: ${error.message}` });
      }
    }

    return { total: rows.length, creados, actualizados, errores };
  }
}
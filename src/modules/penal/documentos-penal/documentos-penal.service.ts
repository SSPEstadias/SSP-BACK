import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

import { ExpedienteCaratula } from '../expediente-caratula/entities/expediente-caratula.entity';
import { PenalExpediente } from '../entities/penal.entity';
import { Beneficiario } from '../../../shared/beneficiarios/beneficiario.entity';
import { FichaSeguimiento } from '../ficha-seguimiento/entities/ficha-seguimiento.entity';
import { NotaEvolucionPsicologica } from '../nota-evolucion-psicologica/entities/nota-evolucion-psicologica.entity';

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function resolveTemplatesRoot(): string {
  if (fs.existsSync(path.join(__dirname, 'templates'))) return __dirname;

  const srcRoot = path.join(
    process.cwd(),
    'src',
    'modules',
    'penal',
    'documentos-penal',
  );

  if (fs.existsSync(path.join(srcRoot, 'templates'))) return srcRoot;

  return __dirname;
}

@Injectable()
export class DocumentosPenalService implements OnModuleInit, OnModuleDestroy {
  private browser!: puppeteer.Browser;

  constructor(
    @InjectRepository(ExpedienteCaratula)
    private readonly caratulaRepo: Repository<ExpedienteCaratula>,
    @InjectRepository(PenalExpediente)
    private readonly expedienteRepo: Repository<PenalExpediente>,
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepo: Repository<Beneficiario>,
    @InjectRepository(FichaSeguimiento)
    private readonly fichaRepo: Repository<FichaSeguimiento>,
    @InjectRepository(NotaEvolucionPsicologica)
    private readonly notaEvolucionRepo: Repository<NotaEvolucionPsicologica>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!Handlebars.helpers['formatDate']) {
      Handlebars.registerHelper('formatDate', (v: unknown) =>
        formatDate(v as Date | string | null),
      );
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.browser?.close();
  }

  private async generarPdf(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    const root = resolveTemplatesRoot();
    const templatePath = path.join(root, 'templates', `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new InternalServerErrorException(
        `No se encontró el template ${templateName}.hbs`,
      );
    }

    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    const html = template(data);

    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  async generarCaratulaPenalPdf(expedienteId: number): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: expedienteId },
      relations: ['beneficiario'],
    });

    if (!expediente) {
      throw new NotFoundException('Expediente penal no encontrado');
    }

    const caratula = await this.caratulaRepo.findOne({
      where: { expediente: { id: expedienteId } },
      relations: ['expediente', 'expediente.beneficiario'],
    });

    if (!caratula) {
      throw new NotFoundException(
        'No existe carátula para este expediente penal',
      );
    }

    const beneficiario = expediente.beneficiario;

    const buffer = await this.generarPdf('caratula_penal', {
      nombre: caratula.nombre ?? beneficiario?.nombre ?? '—',
      alias: caratula.alias ?? '—',
      juzgado: caratula.juzgado ?? expediente.juzgado ?? '—',
      delito: caratula.delito ?? expediente.delito ?? '—',
      agraviado: caratula.agraviado ?? expediente.agraviado ?? '—',
      fechaIngresoPrograma:
        caratula.fechaIngresoPrograma ??
        expediente.fechaIngresoPrograma ??
        null,
      fechaSuspensionProceso:
        caratula.fechaSuspensionProceso ??
        expediente.fechaSuspensionProceso ??
        null,
      fechaFinSupervision:
        caratula.fechaFinSupervision ?? expediente.fechaFinSupervision ?? null,
      medidaCautelar:
        caratula.medidaCautelar ?? expediente.medidaCautelar ?? '—',
      observaciones: caratula.observaciones ?? '—',
      folioExpediente: expediente.folioExpediente ?? '—',
      expedienteTecnico: expediente.expedienteTecnico ?? '—',
      cPenal: expediente.cPenal ?? '—',
      creadoEn: caratula.creadoEn,
    });

    const safeNombre = (
      caratula.nombre ??
      beneficiario?.nombre ??
      'BENEFICIARIO'
    )
      .replace(/[\\/:*?"<>|]/g, '')
      .trim();

    const filename = `CARATULA_PENAL - ${safeNombre.toUpperCase()} - EXP_${expediente.id}.pdf`;

    return { buffer, filename };
  }
  async generarFichaSeguimientoPdf(id: number): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const ficha = await this.fichaRepo.findOne({
      where: { id },
      relations: ['expediente', 'expediente.beneficiario', 'guia'],
    });

    if (!ficha) {
      throw new NotFoundException('Ficha de seguimiento no encontrada');
    }

    const expediente = ficha.expediente;
    const beneficiario = expediente?.beneficiario;

    const buffer = await this.generarPdf('ficha_seguimiento', {
      // DATOS GENERALES
      folioExpediente: expediente?.folioExpediente ?? '—',
      nombre: beneficiario?.nombre ?? '—',
      periodo: ficha.periodo ?? '—',
      fecha: ficha.fecha,
      guia: ficha.guia?.nombre ?? '—',

      // DATOS PERSONALES (JSONB)
      datos: ficha.datosPersonalesJsonb ?? {},

      // CAMPOS TEXTUALES
      cumplimientoGeneral: ficha.cumplimientoGeneral ?? '—',
      comportamiento: ficha.comportamiento ?? '—',
      observaciones: ficha.observaciones ?? '—',
      recomendaciones: ficha.recomendaciones ?? '—',

      // INCIDENCIAS
      incidencias: ficha.incidenciasJsonb ?? {},

      creadoEn: ficha.creadoEn,
    });

    const safeNombre = (beneficiario?.nombre ?? 'BENEFICIARIO')
      .replace(/[\\/:*?"<>|]/g, '')
      .trim();

    const filename = `FICHA_SEGUIMIENTO - ${safeNombre.toUpperCase()} - PERIODO_${ficha.periodo}.pdf`;

    return { buffer, filename };
  }

  async generarNotaEvolucionPsicologicaPdf(id: number): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const nota = await this.notaEvolucionRepo.findOne({
      where: { id },
      relations: ['expediente', 'expediente.beneficiario', 'psicologo'],
    });

    if (!nota) {
      throw new NotFoundException(
        'Nota de evolución psicológica no encontrada',
      );
    }

    const expediente = nota.expediente;
    const beneficiario = expediente?.beneficiario;

    const buffer = await this.generarPdf('nota_evolucion_psicologica', {
      folioExpediente: expediente?.folioExpediente ?? '—',
      expedienteTecnico: expediente?.expedienteTecnico ?? '—',
      cPenal: expediente?.cPenal ?? '—',
      nombreBeneficiario: beneficiario?.nombre ?? '—',
      fecha: nota.fecha,
      numeroSesion: nota.numeroSesion ?? '—',
      psicologo: nota.psicologo?.nombre ?? '—',
      objetivoSesion: nota.objetivoSesion ?? '—',
      descripcionSesion: nota.descripcionSesion ?? '—',
      tecnicasAplicadas: nota.tecnicasAplicadas ?? '—',
      avances: nota.avances ?? '—',
      observaciones: nota.observaciones ?? '—',
      proximaSesion: nota.proximaSesion ?? null,
      creadoEn: nota.creadoEn,
    });

    const safeNombre = (beneficiario?.nombre ?? 'BENEFICIARIO')
      .replace(/[\\/:*?"<>|]/g, '')
      .trim();

    const filename = `NOTA_EVOLUCION_PSICOLOGICA - ${safeNombre.toUpperCase()} - SESION_${nota.numeroSesion}.pdf`;

    return { buffer, filename };
  }
}

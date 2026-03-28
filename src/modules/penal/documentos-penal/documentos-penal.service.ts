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
}

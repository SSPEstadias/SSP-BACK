import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentosService {

  // ── Método central: template → PDF en Buffer ───────────────────────
  async generarPdf(
    tipoDocumento: string,    // ej: 'oficio_incorporacion'
    datos: Record<string, any>, // los datos que llena la plantilla
  ): Promise<Buffer> {

    // 1. Leer el archivo .hbs
    const rutaTemplate = path.join(
      __dirname,
      'templates',
      `${tipoDocumento}.hbs`,
    );

    if (!fs.existsSync(rutaTemplate)) {
      throw new InternalServerErrorException(
        `Template no encontrado: ${tipoDocumento}.hbs`,
      );
    }

    const templateStr = fs.readFileSync(rutaTemplate, 'utf-8');

    // 2. Compilar con Handlebars e inyectar los datos
    const template  = Handlebars.compile(templateStr);
    const htmlFinal = template(datos);

    // 3. Puppeteer: HTML → PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',      // tamaño carta (21.59 x 27.94 cm)
      printBackground: true, // incluye colores e imágenes de fondo
      margin: {
        top:    '1.5cm',
        bottom: '1.5cm',
        left:   '2cm',
        right:  '2cm',
      },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}
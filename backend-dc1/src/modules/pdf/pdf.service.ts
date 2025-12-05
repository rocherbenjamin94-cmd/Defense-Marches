import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { DC1FormData, DC2FormData } from '../../types';
import { generateDC1Html } from './templates/dc1.template';
import { generateDC2Html } from './templates/dc2.template';

@Injectable()
export class PdfService {
  private getLaunchOptions() {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    return {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      ...(executablePath ? { executablePath } : {}),
    };
  }

  async generatePDF(formData: DC1FormData): Promise<Buffer> {
    const browser = await puppeteer.launch(this.getLaunchOptions());

    try {
      const page = await browser.newPage();
      const html = generateDC1Html(formData);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async generateDC2PDF(formData: DC2FormData): Promise<Buffer> {
    const browser = await puppeteer.launch(this.getLaunchOptions());

    try {
      const page = await browser.newPage();
      const html = generateDC2Html(formData);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  renderTemplate(formData: DC1FormData): string {
    return generateDC1Html(formData);
  }

  renderDC2Template(formData: DC2FormData): string {
    return generateDC2Html(formData);
  }
}

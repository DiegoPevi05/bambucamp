import puppeteer from 'puppeteer';

interface RenderReportOptions {
  format?: 'A4' | 'Letter';
}

export const renderReportPdf = async (
  html: string,
  options: RenderReportOptions = {},
): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: options.format ?? 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        bottom: '16mm',
        left: '12mm',
        right: '12mm',
      },
    });

    await page.close();
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};

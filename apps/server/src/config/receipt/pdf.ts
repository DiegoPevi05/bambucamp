import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { ReserveDto } from '../../dto/reserve';
import { formatDateToYYYYMMDD, formatPrice, getRangeDatesForReserve } from '../../lib/utils';
import { BadRequestError } from '../../middleware/errors';

const CLIENT_HOSTNAME = process.env.CLIENT_HOSTNAME || 'https://bambucamp.pe';
const LOGO_PATH = process.env.LOGO_PATH || path.resolve(process.cwd(), 'public', 'logo.png');

// tiny helper to embed local files as data URIs (logo, etc.)
function fileToDataURI(fp: string): string | null {
  try {
    const abs = path.resolve(fp);
    const buf = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase();
    const mime =
      ext === '.png' ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
          : ext === '.svg' ? 'image/svg+xml'
            : 'application/octet-stream';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export const generateSalesNote = async (
  reserve: ReserveDto,
  t: (key: string) => string
): Promise<Buffer> => {
  try {
    // Load and pre-process template
    const templatePath = path.join(__dirname, 'templates/sales_note.html');
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Remove Google Fonts @import to avoid network fetch in headless
    templateContent = templateContent.replace(
      /@import\s+url\(['"]https?:\/\/fonts\.googleapis\.com[^)]+\);\s*/i,
      ''
    );

    // Compile Handlebars
    const template = handlebars.compile(templateContent);

    // Build items strings
    let tentsItems = '';
    reserve.tents.forEach((tent, idx) => {
      const basePrice = tent.price ?? 0;
      const kidsPrice = tent.kids_price ?? 0;
      const addPeoplePrice = tent.additional_people_price ?? 0;
      const extraPeople = tent.additional_people ?? 0;
      const kidsCount = tent.kids ?? 0;

      // Total per night = base + kids + additional people
      const nightlyTotal = basePrice + kidsPrice + (addPeoplePrice * extraPeople);
      const totalPerTent = nightlyTotal * tent.nights;

      const extraAdultsInfo =
        extraPeople > 0
          ? ` | ADP: ${extraPeople} × ${formatPrice(addPeoplePrice)}`
          : '';
      const kidsInfo =
        kidsCount > 0
          ? ` | KDS: ${kidsCount}${kidsPrice > 0 ? ` KDPP: ${formatPrice(kidsPrice)}` : ''}`
          : '';

      tentsItems += `
        <tr>
          <td>${idx + 1}</td>
          <td>
            ${tent.name} 
            | ${t('reserve.from')}: ${formatDateToYYYYMMDD(tent.dateFrom)} 
            ${t('reserve.to')}: ${formatDateToYYYYMMDD(tent.dateTo)} 
            ${extraAdultsInfo}${kidsInfo}
          </td>
          <td>${t('reserve.nights')}</td>
          <td>${formatPrice(nightlyTotal)}</td>
          <td>${tent.nights}</td>
          <td>${formatPrice(totalPerTent)}</td>
        </tr>`;
    });

    let experiencesItems = '';
    reserve.experiences.forEach((experience, i) => {
      const rowNum = reserve.tents.length + i + 1;
      experiencesItems += `
        <tr>
          <td>${rowNum}</td>
          <td>${experience.name} | ${t('reserve.day_of_experience')} ${formatDateToYYYYMMDD(experience.day)}</td>
          <td>${t('reserve.unit')}</td>
          <td>${formatPrice(experience.price)}</td>
          <td>${experience.quantity}</td>
          <td>${formatPrice(experience.price * experience.quantity)}</td>
        </tr>`;
    });

    let productsItems = '';
    reserve.products.forEach((product, i) => {
      const rowNum = reserve.tents.length + reserve.experiences.length + i + 1;
      productsItems += `
        <tr>
          <td>${rowNum}</td>
          <td>${product.name}</td>
          <td>${t('reserve.unit')}</td>
          <td>${formatPrice(product.price)}</td>
          <td>${product.quantity}</td>
          <td>${formatPrice(product.price * product.quantity)}</td>
        </tr>`;
    });

    // NEW: extraItems
    let extraItemsRows = '';
    const baseIndex = reserve.tents.length + reserve.experiences.length + reserve.products.length;
    (reserve.extraItems ?? []).forEach((x, i) => {
      const rowNum = baseIndex + i + 1;
      extraItemsRows += `
        <tr>
          <td>${rowNum}</td>
          <td>${x.name}</td>
          <td>${t('reserve.unit')}</td>
          <td>${formatPrice(x.price)}</td>
          <td>${x.quantity}</td>
          <td>${formatPrice(x.price * x.quantity)}</td>
        </tr>`;
    });

    // Data for template
    const data = {
      title: reserve.external_id,
      external_id: reserve.external_id,
      username: `${reserve.user_name ?? ''} | ${reserve.user_email ?? ''}`,
      CheckIn: `${getRangeDatesForReserve(reserve)[0].label}`,
      CheckOut: `${getRangeDatesForReserve(reserve)[1].label}`,
      gross_import: `${reserve.gross_import}`,
      discounted_import: `${(reserve.discount / 100) * reserve.gross_import}`,
      net_import: `${reserve.net_import}`,
      link_web_page: CLIENT_HOSTNAME,
      web_page: CLIENT_HOSTNAME,
      tents_items: tentsItems,
      experiences_items: experiencesItems,
      products_items: productsItems,
      extra_items: extraItemsRows,
      logo_data_uri: fileToDataURI(LOGO_PATH) // null-safe; if null, template should still render
    };

    const html = template(data);

    // Puppeteer launch with safe flags
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    // Helpful logs if something still fails
    page.on('requestfailed', req => console.error('[PDF requestfailed]', req.url(), req.failure()?.errorText));
    page.on('pageerror', err => console.error('[PDF pageerror]', err));
    page.on('console', msg => console.log('[PDF console]', msg.type(), msg.text()));

    // Avoid waiting for external assets
    await page.goto('data:text/html,' + encodeURIComponent(html), { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({ format: 'A4', printBackground: true });

    await page.close();
    await browser.close();

    return Buffer.from(pdf);
  } catch (error) {
    console.error('Error generating sales note PDF:', error);
    throw new BadRequestError('error.failedToGeneratePDF');
  }
};

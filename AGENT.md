
# Agent.MD — Inventory & Reports Upgrade (BambuCamp Monorepo)
_Last updated: 2025-10-21_

## Goals (TL;DR)
1) **Fix user creation/update (Admin):** resolve 500s when creating/updating **Supervisor** or **Common** users. Add **Generate Password** button that fills the password field.
2) **Inventory Reports:** backend routes + services to download **Inventory Report** (PDF or CSV) by date range, sortable and filterable per product. Layout: **logo left**, **current date & user & date range right**, **centered title**, followed by per‑product **ledger blocks** (same look & order as Admin → Inventory → History).
3) **Statistics page:** restore sales/reserve statistics endpoint and add **Sales/Reserves Report** (PDF/CSV) with same header layout and rows per reserve: `external_id`, `gross_total`, `dateFrom → dateTo`.

---

## Repo Impact (delta)
```
apps/
  admin/
    src/
      pages/
        Users/
          CreateUser.tsx            # UPDATED (random password button)
          EditUser.tsx              # UPDATED (random password button)
        Inventory/
          index.tsx                 # UPDATED (Download Report button + modal)
        Statistics/
          index.tsx                 # UPDATED (fetch fix + Download Report modal)
      db/
        actions/
          users.ts                  # UPDATED (create/update payloads)
          reports.ts                # NEW (inventory & sales report calls)
      lib/
        schemas/
          users.ts                  # UPDATED (supervisor/common validation)
          reports.ts                # NEW (zod schemas for report forms)
      i18n/
        en/reports.json             # NEW
        es/reports.json             # NEW

apps/
  server/
    src/
      controllers/
        userController.ts          # UPDATED (robust validation + errors)
        reportController.ts        # NEW (inventory & sales endpoints)
      routes/
        userRoutes.ts              # UPDATED (create/update)
        reportRoutes.ts            # NEW
      services/
        userService.ts             # UPDATED (role & hashing fixes)
        reportService.ts           # NEW (PDF/CSV generators orchestrator)
      repositories/
        userRepository.ts                # UPDATED (create/update)
        inventoryRepository.ts           # UPDATED (sum & range queries for reports)
        reserveRepository.ts             # UPDATED (statistics query + report data by date)
      config/
        reports/
          templates/
            _baseReport.css         # NEW (shared minimal CSS)
            inventoryReport.html.ts # NEW (EN/ES aware)
            salesReport.html.ts     # NEW (EN/ES aware)
          pdf.ts            # NEW (shared HTML→PDF using Puppeteer or html-pdf)
        
      locales/
        en/translations.json             # UPDATED
        es/translations.json             # UPDATED
```

> **Note**: Names align with your current structure; adapt paths if you keep `config/receipt/pdf` utilities. We reuse HTML→PDF pattern like `generateSalesNote` for consistency.

---

## 1) Fix User Creation/Update (and Random Password)

### Common Root Causes of 500s (fixed)
- **Role enum mismatch** (e.g., `SUPERVISOR` not matching Prisma enum or not allowed in controller).
- **Missing hashing** for `password` on create/update.
- **Unique email** constraint throwing but not caught → return 409/conflict.
- **Optional fields** (`phone`, `lastName`) passed as `""` instead of `null` breaking validators.

### Backend Changes

#### `user.service.ts` (excerpt)
```ts
import bcrypt from "bcryptjs";
import { Role, Prisma } from "@prisma/client";
import * as userRepo from "../repositories/user.repo";
import { BadRequestError, NotFoundError } from "../middlewares/errors";

const ALLOWED_ROLES: Role[] = [Role.ADMIN, Role.SUPERVISOR, Role.CLIENT, Role.COMMON];

export async function createUser(input: {
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  role: Role; // "SUPERVISOR" or "COMMON" supported
}) {
  if (!ALLOWED_ROLES.includes(input.role)) {
    throw new BadRequestError("validation.invalidRole");
  }
  const hashed = await bcrypt.hash(input.password, 10);
  try {
    return await userRepo.create({
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      email: input.email.toLowerCase().trim(),
      password: hashed,
      role: input.role,
      status: "ACTIVE",
    });
  } catch (e:any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new BadRequestError("validation.emailAlreadyExists");
    }
    throw e;
  }
}

export async function updateUser(id:number, input: {
  firstName?: string;
  lastName?: string | null;
  email?: string;
  password?: string;
  role?: Role;
  status?: "ACTIVE"|"INACTIVE";
}) {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError("error.noUserFoundInDB");

  const data:any = {};
  if (input.firstName != null) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName ?? null;
  if (input.email != null) data.email = input.email.toLowerCase().trim();
  if (input.role != null) {
    if (!ALLOWED_ROLES.includes(input.role)) throw new BadRequestError("validation.invalidRole");
    data.role = input.role;
  }
  if (input.status) data.status = input.status;
  if (input.password) data.password = await bcrypt.hash(input.password, 10);

  try {
    return await userRepo.update(id, data);
  } catch (e:any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new BadRequestError("validation.emailAlreadyExists");
    }
    throw e;
  }
}
```

#### `user.controller.ts` (excerpt)
```ts
import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const create = async (req:Request, res:Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (e:any) {
    const msg = e.message || "Unexpected error";
    res.status(400).json({ error: msg });
  }
};

export const update = async (req:Request, res:Response) => {
  try {
    const id = Number(req.params.id);
    const user = await userService.updateUser(id, req.body);
    res.json(user);
  } catch (e:any) {
    res.status(400).json({ error: e.message || "Unexpected error" });
  }
};
```

### Admin UI: Random Password Button

#### Reusable util
```ts
// apps/admin/src/lib/password.ts
export function generateStrongPassword(len=14) {
  const upp="ABCDEFGHJKLMNPQRSTUVWXYZ";
  const low="abcdefghijkmnopqrstuvwxyz";
  const num="23456789";
  const sym="!@#$%^&*()-_=+[]{}:,./?";
  const all = upp+low+num+sym;
  const pick = (s:string)=> s[Math.floor(Math.random()*s.length)];
  let pwd = pick(upp)+pick(low)+pick(num)+pick(sym);
  for (let i=pwd.length;i<len;i++) pwd+=pick(all);
  return pwd.split("").sort(()=>Math.random()-0.5).join("");
}
```

#### Hook it in the forms
```tsx
// apps/admin/src/pages/Users/CreateUser.tsx (similar in EditUser.tsx)
import { generateStrongPassword } from "../../lib/password";
// ...
<button type="button" onClick={()=>{
  const p = generateStrongPassword();
  setValue("password", p); // react-hook-form setValue
}} className="btn btn-ghost btn-sm">
  Generate Password
</button>
```

#### i18n keys
```
users.generate_password: "Generate password"
users.generate_password_es: "Generar contraseña"
validation.emailAlreadyExists: "Email already exists"
validation.invalidRole: "Invalid role"
```

---

## 2) Inventory Report (PDF & CSV)

### Requirements Recap
- Header: **logo left**, **current date**, **selected range**, **current user** at top-right.
- Title: centered: **Inventory Report** / **Reporte de Inventario** (i18n).
- Body: For **each product** in the result set:
  - One **product header row** (product name + current stock optional).
  - Followed by its **ledger items** within the date range, each showing: date, type (IN/OUT/ADJ), quantity (with +/− sign), note/reference.
  - Then move to next product.
- Filters: date range, sort (stock desc/asc or qty desc/asc), specific product IDs.
- Formats: **PDF** (Buffer/byte array) or **CSV**.

### Backend

#### Route
```
GET /reports/inventory?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&format=pdf|csv&sort=stock_desc|stock_asc|qty_desc|qty_asc&productIds=1,2,3&lang=en|es
Auth: ADMIN/MANAGER
Returns: application/pdf (Buffer) or text/csv
```

#### Controller (`report.controller.ts` excerpt)
```ts
export const inventoryReport = async (req:Request, res:Response) => {
  const { dateFrom, dateTo, format="pdf", sort, productIds, lang="en" } = req.query as any;
  const user = (req as any).user;
  const ids = typeof productIds === "string" && productIds.length ? productIds.split(",").map(Number) : undefined;
  try {
    const { buffer, filename, contentType } = await ReportService.generateInventoryReport({
      dateFrom, dateTo, sort, productIds: ids, lang,
      userName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
    }, format as "pdf"|"csv");

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  } catch (e:any) {
    res.status(400).json({ error: e.message || "Unable to generate report" });
  }
};
```

#### Service (`report.service.ts` excerpt)
```ts
import { InventoryRepo } from "../repositories/inventory.repo";
import { ProductRepo } from "../repositories/product.repo";
import { buildInventoryReportHTML } from "../config/receipt/templates/inventoryReport.html";
import { htmlToPDF } from "./pdf/pdf.service";
import { toCSV } from "./util/csv";

export async function generateInventoryReport(params: {
  dateFrom?: string; dateTo?: string; sort?: string; productIds?: number[]; lang: "en"|"es"; userName?: string;
}, format: "pdf"|"csv") {
  const range = normalizeRange(params.dateFrom, params.dateTo);
  const products = await fetchProductsForReport(params.productIds); // with computed stock
  const ledgers = await fetchLedgersForProducts(products.map(p=>p.id), range);

  // sort options: by current stock or by total qty moved in range
  const sortKey = params.sort ?? "stock_desc";
  const stats = summarize(products, ledgers); // totals per product in range
  const ordered = orderProducts(products, stats, sortKey);

  if (format === "pdf") {
    const html = buildInventoryReportHTML({
      lang: params.lang,
      generatedAt: new Date(),
      range,
      userName: params.userName ?? "—",
      products: ordered.map(p => ({
        product: p,
        entries: ledgers.get(p.id) ?? []
      })),
    });
    const buffer = await htmlToPDF(html, { css: "_baseReport.css", headerLogo: "/public/images/logo.png" });
    return { buffer, filename: filename("inventory", range), contentType: "application/pdf" };
  } else {
    const rows = [];
    for (const p of ordered) {
      rows.push({ type: "PRODUCT", name: p.name, id: p.id, stock: p.stock });
      for (const e of (ledgers.get(p.id) ?? [])) {
        rows.push({
          type: e.type, date: e.createdAt.toISOString(),
          qty: (e.type === "OUT" ? -e.quantity : e.quantity),
          note: e.note ?? "", reference: e.reference ?? ""
        });
      }
    }
    const buffer = Buffer.from(toCSV(rows), "utf8");
    return { buffer, filename: filename("inventory", range, "csv"), contentType: "text/csv" };
  }
}
```

#### HTML Template (`inventoryReport.html.ts`, simplified)
```ts
import i18n from "../../locales/i18nReport";
export function buildInventoryReportHTML(ctx:{
  lang:"en"|"es"; generatedAt:Date; range:{from?:Date; to?:Date};
  userName:string; products:{product:any; entries:any[]}[];
}) {
  const t = (k:string)=> i18n(ctx.lang, k);
  const fmt = (d?:Date)=> d ? d.toLocaleDateString() : "—";
  return `
<!DOCTYPE html><html lang="${ctx.lang}"><head>
<meta charset="utf-8" /><style>${baseCSS()}</style></head>
<body>
  <header class="report-header">
    <div class="left"><img src="{{LOGO_PATH}}" class="logo" /></div>
    <div class="right">
      <div>${t("generated_at")}: ${fmt(ctx.generatedAt)}</div>
      <div>${t("range")}: ${fmt(ctx.range.from)} – ${fmt(ctx.range.to)}</div>
      <div>${t("user")}: ${ctx.userName}</div>
    </div>
  </header>
  <h1 class="title">${t("inventory_report")}</h1>
  ${ctx.products.map(({product, entries}) => `
    <section class="product-block">
      <div class="product-header">${product.name} <span class="muted">(${t("stock")}: ${product.stock})</span></div>
      <div class="ledger">
        ${entries.length ? entries.map(e => `
          <div class="row">
            <span class="date">${fmt(e.createdAt)}</span>
            <span class="type ${e.type.toLowerCase()}">${t(e.type.toLowerCase())}</span>
            <span class="qty">${e.type==="OUT"?"-":""}${e.quantity}</span>
            <span class="ref">${e.reference ?? ""}</span>
            <span class="note">${e.note ?? ""}</span>
          </div>
        `).join("") : `<div class="row empty">${t("no_entries")}</div>`}
      </div>
    </section>
  `).join("")}
</body></html>`;
}
```

#### i18n (`locales/en/reports.json` & `es/reports.json`)
```json
// en
{
  "inventory_report": "Inventory Report",
  "sales_report": "Sales Report",
  "generated_at": "Generated at",
  "range": "Range",
  "user": "User",
  "stock": "Stock",
  "in": "IN",
  "out": "OUT",
  "adjustment": "ADJUSTMENT",
  "no_entries": "No entries",
  "external_id": "External ID",
  "gross_total": "Gross Total",
  "from_to": "From → To"
}
// es
{
  "inventory_report": "Reporte de Inventario",
  "sales_report": "Reporte de Ventas",
  "generated_at": "Generado el",
  "range": "Rango",
  "user": "Usuario",
  "stock": "Stock",
  "in": "ENTRADA",
  "out": "SALIDA",
  "adjustment": "AJUSTE",
  "no_entries": "Sin movimientos",
  "external_id": "ID Externo",
  "gross_total": "Total Bruto",
  "from_to": "Desde → Hasta"
}
```

### Admin UI

#### New modal on Inventory page
- Fields: Date range (from/to), Sort (stock desc/asc, qty desc/asc), Product multi‑select, Format (PDF/CSV).
- Calls `GET /reports/inventory` with query params; streams file.

```tsx
// apps/admin/src/pages/Inventory/index.tsx (snippet)
<Button onClick={()=>setOpenReport(true)}>{t("reports.download")}</Button>
<ReportModal isOpen={openReport} onClose={()=>setOpenReport(false)} onSubmit={(payload)=>{
  const qs = new URLSearchParams(payload as any).toString();
  window.location.href = `/api/reports/inventory?${qs}`;
}} />
```

---

## 3) Statistics Fix + Sales/Reserves Report

### Backend
- Ensure your existing `reserveRepository.getNetSalesStatistics` and `getReserveQuantityStatistics` are exposed by a controller endpoint (e.g., `GET /statistics/sales?step=&type=&dateFrom=&dateTo=`). Fix any date filters (use **inclusive start/exclusive end**).
- New route for **Sales Report**:
```
GET /reports/sales?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&format=pdf|csv&lang=en|es
Auth: ADMIN/MANAGER
```
- Data rows: each **Reserve** completed/paid within range:
  - `external_id`, `gross_import`, `dateFrom → dateTo` (from latest tent block or from reserve.date range if present).

#### Controller (excerpt)
```ts
export const salesReport = async (req:Request, res:Response) => {
  const { dateFrom, dateTo, format="pdf", lang="en" } = req.query as any;
  const user = (req as any).user;
  const result = await ReportService.generateSalesReport({ dateFrom, dateTo, lang, userName: user?.firstName ?? "" }, format as "pdf"|"csv");
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.setHeader("Content-Type", result.contentType);
  res.send(result.buffer);
};
```

#### Service (excerpt)
```ts
export async function generateSalesReport(params:{dateFrom?:string; dateTo?:string; lang:"en"|"es"; userName?:string}, format:"pdf"|"csv") {
  const range = normalizeRange(params.dateFrom, params.dateTo);
  const reserves = await reserveReportRows(range); // SELECT only COMPLETE & PAID, with external_id, gross_import, dateFrom/dateTo
  if (format === "pdf") {
    const html = buildSalesReportHTML({ lang: params.lang, generatedAt: new Date(), range, userName: params.userName ?? "—", reserves });
    const buffer = await htmlToPDF(html, { css: "_baseReport.css", headerLogo: "/public/images/logo.png" });
    return { buffer, filename: filename("sales", range), contentType: "application/pdf" };
  } else {
    const rows = reserves.map(r => ({
      external_id: r.external_id,
      gross_total: r.gross_import,
      from: r.dateFrom.toISOString().slice(0,10),
      to: r.dateTo.toISOString().slice(0,10),
    }));
    const buffer = Buffer.from(toCSV(rows), "utf8");
    return { buffer, filename: filename("sales", range, "csv"), contentType: "text/csv" };
  }
}
```

#### HTML Template (`salesReport.html.ts`, similar to inventory)
- Same header & i18n; body is a simple list of rows styled like your Admin table.

### Admin UI
- **Statistics page**: fix API call to `/statistics/sales` and add **Download Report** button with modal (date range + format PDF/CSV).
- On submit → hit `/reports/sales?...` and stream file.

---

## Wiring Routes
```ts
// apps/server/src/routes/report.routes.ts
import { Router } from "express";
import * as ctrl from "../controllers/report.controller";
import { requiresAuth, requiresRole } from "../middlewares/auth";
const r = Router();

r.get("/reports/inventory", requiresAuth, requiresRole(["ADMIN","MANAGER"]), ctrl.inventoryReport);
r.get("/reports/sales",     requiresAuth, requiresRole(["ADMIN","MANAGER"]), ctrl.salesReport);

export default r;

// index.ts (router root)
app.use("/api", reportRoutes);
```

---

## Utilities

#### `pdf.ts` (shared HTML → PDF)
```ts
import puppeteer from "puppeteer"; // or html-pdf if you already use it

export async function htmlToPDF(html:string, opts:{css?:string; headerLogo?:string}) {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  // Inline CSS & logo token replacement
  const final = html.replace("{{LOGO_PATH}}", opts.headerLogo ?? "");
  await page.setContent(final, { waitUntil: "networkidle0" });
  const buffer = await page.pdf({ format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "12mm", right: "12mm" } });
  await browser.close();
  return buffer;
}
```

#### `util/csv.ts`
```ts
export function toCSV(rows:any[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v:any)=> `"${String(v ?? "").replace(/"/g,'""')}"`;
  const out = [headers.join(",")];
  for (const r of rows) out.push(headers.map(h=>esc(r[h])).join(","));
  return out.join("\n");
}
```

---

## Admin i18n (extra)
```json
// en/reports.json
{
  "reports": {
    "download": "Download report",
    "inventory_title": "Inventory Report",
    "sales_title": "Sales Report",
    "range_from": "From",
    "range_to": "To",
    "format": "Format",
    "pdf": "PDF",
    "csv": "CSV",
    "sort": "Sort",
    "products": "Products",
    "stock_desc": "Stock (high → low)",
    "stock_asc": "Stock (low → high)",
    "qty_desc": "Movement (high → low)",
    "qty_asc": "Movement (low → high)"
  }
}
// es/reports.json
{
  "reports": {
    "download": "Descargar reporte",
    "inventory_title": "Reporte de Inventario",
    "sales_title": "Reporte de Ventas",
    "range_from": "Desde",
    "range_to": "Hasta",
    "format": "Formato",
    "pdf": "PDF",
    "csv": "CSV",
    "sort": "Orden",
    "products": "Productos",
    "stock_desc": "Stock (mayor → menor)",
    "stock_asc": "Stock (menor → mayor)",
    "qty_desc": "Movimiento (mayor → menor)",
    "qty_asc": "Movimiento (menor → mayor)"
  }
}
```

---

## Acceptance Checklist
- [ ] Creating/updating **Supervisor**/**Common** users works (no 500).
- [ ] Admin form shows **Generate password** button that fills the password field.
- [ ] `GET /reports/inventory` streams **PDF/CSV** with requested filter/sort/IDs; layout matches spec.
- [ ] Admin Inventory page: **Download report** button + modal.
- [ ] Statistics endpoint works; charts re-populate.
- [ ] `GET /reports/sales` streams **PDF/CSV** with requested range; layout matches spec.
- [ ] i18n for EN/ES renders correct titles/labels.
- [ ] Error responses are user-friendly (400) and do not leak stack traces in prod.

---

## Migration/Deploy Notes
1. Install new deps if using Puppeteer: `npm i puppeteer` (or reuse your existing PDF lib).
2. Add `report.routes.ts` to router.
3. Add `reports.json` to both locales (admin & backend).
4. Verify logo path in `htmlToPDF` options.
5. Test CSV encoding (UTF‑8 with BOM if needed for Excel).

---

## Future Enhancements
- Add **low stock** scheduled email export.
- Add checksum/`reference` uniqueness for idempotent posting.
- Allow **per‑warehouse** filtering (next phase).

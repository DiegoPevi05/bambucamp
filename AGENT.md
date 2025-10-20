# Agent.MD — Inventory System Integration (BambuCamp Monorepo)

## Goal (TL;DR)
Introduce a **Product Inventory** system that:
- Tracks **stock via transactions** (in/out/adjustment) instead of editing `product.stock` directly.
- Keeps **admin & client responses unchanged** (backward-compatible), still returning a simple `stock` (computed).
- Adds new **inventory domain (repo/service/controller)** on the server and a **new Inventory page** in the Admin app.
- Adds **shared types** and **Prisma schema** for inventory.
- Supports **refill** workflows and per-product **ledger** (income/outcome) with pagination and filters.

---

## Scope & Non-Goals
### In Scope
- New `InventoryTransaction` model in Prisma.
- Backfill/one-time migration from existing `Product.stock` → opening balance transaction.
- Server APIs:
  - `GET /products` returns products with computed `stock`.
  - `GET /inventory/:productId/transactions` paginated ledger.
  - `POST /inventory/transactions` to add stock movements (IN/OUT/ADJUSTMENT).
- Admin UI: Inventory page to:
  - View product list & stock.
  - Add stock transactions (refill, remove, adjust).
  - View detailed ledger per product.
- Shared types for products & inventory.
- Unit/integration tests for service logic.

### Out of Scope
- Multi-warehouse/locations.
- Batch/lot expiry, BOM, or manufacturing.
- Client app changes other than **reading same product shape**.

---

## Architecture Overview
Stock will be **derived** from the sum of inventory transactions:
```
computed_stock(product_id) = Σ quantity (IN) - Σ quantity (OUT) + Σ quantity (ADJUSTMENT)
```
We **deprecate direct edits** to `Product.stock` and **retain** the field only as a **computed** response (server-side), keeping the client/admin contract stable.

---

## Repo Impact
```
bambucamp-monorepo/
├── apps/
│   ├── admin/
│   │   └── src/
│   │       ├── pages/Inventory/                 # NEW: Inventory list + detail
│   │       ├── db/actions/inventory.ts          # NEW: API calls
│   │       └── lib/schemas/inventory.ts         # NEW: Zod schemas
│   └── backend/
│       └── src/
│           ├── prisma/schema.prisma             # UPDATED: Product; NEW: InventoryTransaction
│           ├── routes/inventory.routes.ts       # NEW
│           ├── controllers/inventory.controller.ts   # NEW
│           ├── services/inventory.service.ts    # NEW
│           ├── repositories/inventory.repo.ts   # NEW
│           ├── repositories/product.repo.ts     # UPDATED (computed stock)
│           └── controllers/products.controller.ts    # UPDATED (computed stock)
├── packages/
│   └── shared-types/
│       └── src/index.ts                         # UPDATED: Product, NEW: Inventory types & enums
└── docs/
    └── Agent.MD                                 # THIS FILE
```

---

## Data Model

### Prisma Schema (backend/src/prisma/schema.prisma)
```prisma
model Product {
  id            Int       @id @default(autoincrement())
  name          String
  // price, custom_price, etc… (existing fields)
  // REMOVE direct writes to stock. If `stock` exists, keep but do not use for writes.
  stock         Int?      @default(0) // optional legacy; not written directly anymore

  // Relations
  inventoryTransactions InventoryTransaction[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum InventoryMovementType {
  IN
  OUT
  ADJUSTMENT
}

model InventoryTransaction {
  id            Int                      @id @default(autoincrement())
  productId     Int
  type          InventoryMovementType
  quantity      Int                       // positive integer
  note          String?                   // optional reason
  reference     String?                   // doc/ref number (e.g., PO-123, SALE-444)
  createdById   Int?                      // optional user id
  createdAt     DateTime                  @default(now())

  product       Product                   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, createdAt])
}
```

### Backfill/Migration Plan
1. **Add models** and run migration.
2. **Backfill script**:
   - For each product, read existing `product.stock` (or 0).
   - Create a single `InventoryTransaction` with:
     - `type = IN`
     - `quantity = product.stock`
     - `note = "Opening balance migration"`
     - `reference = "MIGRATION"`
3. Keep `product.stock` in DB for now, but **stop writing to it**. All future stock updates go through inventory transactions.
4. In responses, **compute stock from transactions** (see service).

---

## Shared Types (packages/shared-types/src/index.ts)
```ts
// === Enums ===
export enum InventoryMovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}

// === Inventory ===
export interface InventoryTransactionDTO {
  id: number;
  productId: number;
  type: InventoryMovementType;
  quantity: number;     // always positive
  note?: string;
  reference?: string;
  createdById?: number | null;
  createdAt: string;    // ISO
}

// For creation
export interface CreateInventoryTransactionInput {
  productId: number;
  type: InventoryMovementType;
  quantity: number;     // > 0
  note?: string;
  reference?: string;
}

// === Product (client/admin contract unchanged) ===
export interface ProductDTO {
  id: number;
  name: string;
  price: number;
  custom_price?: number | null;
  // ... other fields you already return
  stock: number; // computed on server (sum of transactions)
}
```

---

## Server: Repository / Service / Controller

### Repository
#### `repositories/inventory.repo.ts`
```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const InventoryRepo = {
  create: (data: {
    productId: number;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    note?: string;
    reference?: string;
    createdById?: number | null;
  }) => prisma.inventoryTransaction.create({ data }),

  findByProduct: (productId: number, skip = 0, take = 20) =>
    prisma.inventoryTransaction.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      skip, take,
    }),

  countByProduct: (productId: number) =>
    prisma.inventoryTransaction.count({ where: { productId } }),

  sumForProduct: async (productId: number) => {
    // compute: IN - OUT + ADJUSTMENT
    const all = await prisma.inventoryTransaction.groupBy({
      by: ["type"],
      where: { productId },
      _sum: { quantity: true },
    });
    const m = Object.fromEntries(all.map(x => [x.type, x._sum.quantity ?? 0]));
    return (m.IN ?? 0) - (m.OUT ?? 0) + (m.ADJUSTMENT ?? 0);
  },
};
```

#### `repositories/product.repo.ts` (UPDATED)
```ts
import { PrismaClient } from "@prisma/client";
import { InventoryRepo } from "./inventory.repo";
const prisma = new PrismaClient();

export const ProductRepo = {
  listWithComputedStock: async (skip = 0, take = 20) => {
    const products = await prisma.product.findMany({ skip, take, orderBy: { id: "asc" } });
    const withStock = await Promise.all(
      products.map(async p => {
        const stock = await InventoryRepo.sumForProduct(p.id);
        return { ...p, stock };
      })
    );
    const total = await prisma.product.count();
    return { items: withStock, total };
  },

  getByIdWithStock: async (id: number) => {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    const stock = await InventoryRepo.sumForProduct(id);
    return { ...p, stock };
  },
};
```

### Service
#### `services/inventory.service.ts`
```ts
import { InventoryRepo, ProductRepo } from "../repositories";
import { InventoryMovementType } from "@prisma/client";

export const InventoryService = {
  addTransaction: async (input: {
    productId: number;
    type: InventoryMovementType;
    quantity: number;
    note?: string;
    reference?: string;
    userId?: number | null;
  }) => {
    if (input.quantity <= 0) throw new Error("Quantity must be > 0");

    // Prevent negative stock on OUT (business rule)
    if (input.type === "OUT") {
      const current = await InventoryRepo.sumForProduct(input.productId);
      if (current - input.quantity < 0) {
        throw new Error("Insufficient stock");
      }
    }

    return InventoryRepo.create({
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      note: input.note,
      reference: input.reference,
      createdById: input.userId ?? null,
    });
  },

  getLedger: async (productId: number, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      InventoryRepo.findByProduct(productId, skip, pageSize),
      InventoryRepo.countByProduct(productId),
    ]);
    return { items, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page };
  },
};

export const ProductService = {
  list: (page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    return ProductRepo.listWithComputedStock(skip, pageSize);
  },
  get: (id: number) => ProductRepo.getByIdWithStock(id),
};
```

### Controller / Routes
#### `controllers/inventory.controller.ts`
```ts
import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.service";

export const InventoryController = {
  create: async (req: Request, res: Response) => {
    try {
      const { productId, type, quantity, note, reference } = req.body;
      const userId = (req as any).user?.id ?? null; // depends on your auth middleware
      const tx = await InventoryService.addTransaction({ productId, type, quantity, note, reference, userId });
      res.status(201).json(tx);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  ledger: async (req: Request, res: Response) => {
    const productId = Number(req.params.productId);
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await InventoryService.getLedger(productId, page, pageSize);
    res.json(data);
  },
};
```

#### `routes/inventory.routes.ts`
```ts
import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";
import { requiresAuth, requiresRole } from "../middlewares/auth"; // your existing middlewares

const router = Router();

// Admin-only routes
router.post(
  "/inventory/transactions",
  requiresAuth,
  requiresRole(["ADMIN", "MANAGER"]),
  InventoryController.create
);

router.get(
  "/inventory/:productId/transactions",
  requiresAuth,
  requiresRole(["ADMIN", "MANAGER"]),
  InventoryController.ledger
);

export default router;
```

#### `controllers/products.controller.ts` (UPDATED extract)
```ts
import { Request, Response } from "express";
import { ProductService } from "../services/inventory.service";

export const ProductsController = {
  list: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const { items, total } = await ProductService.list(page, pageSize);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    res.json({ products: items, totalPages, currentPage: page });
  },

  get: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = await ProductService.get(id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  },
};
```

> **Note**: Wire `inventory.routes.ts` into your server router index.

---

## Validation (Zod)
`apps/admin/src/lib/schemas/inventory.ts`
```ts
import { z } from "zod";

export const CreateInventoryTransactionSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().int().positive(),
  note: z.string().max(255).optional(),
  reference: z.string().max(255).optional(),
});
export type CreateInventoryTransactionForm = z.infer<typeof CreateInventoryTransactionSchema>;
```

---

## Admin UI

### New Page: `apps/admin/src/pages/Inventory/index.tsx`
**Views:**
1. **Inventory List**
   - Columns: Product, Current Stock, Price, Actions (View Ledger, Add Transaction)
   - Filters: Name contains, In-stock/Out-of-stock, Min/Max stock.
   - Pagination.
2. **Drawer / Modal: Add Transaction**
   - Form: Type (IN/OUT/ADJUSTMENT), Quantity, Note, Reference
   - Validates with Zod.
3. **Product Ledger**
   - Paginated list of transactions with columns: Date, Type, Qty (+/- label), Note, Reference, User.
   - Running balance (optional).

**API Calls** (`apps/admin/src/db/actions/inventory.ts`)
```ts
import { CreateInventoryTransactionForm } from "../../lib/schemas/inventory";

export const getInventoryProducts = async (token: string, page: number, pageSize: number, language: string) => {
  const res = await fetch(`/api/products?page=${page}&pageSize=${pageSize}&lang=${language}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getProductLedger = async (token: string, productId: number, page: number, pageSize: number) => {
  const res = await fetch(`/api/inventory/${productId}/transactions?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createInventoryTransaction = async (token: string, payload: CreateInventoryTransactionForm) => {
  const res = await fetch(`/api/inventory/transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Error creating transaction");
  return res.json();
};
```

**UX Notes**
- Use same design system components (Button, Modal, InputRadio).
- i18n keys:
  - `inventory.title`, `inventory.add_transaction`, `inventory.type`, `inventory.quantity`, `inventory.note`, `inventory.reference`, `inventory.ledger`, `inventory.in`, `inventory.out`, `inventory.adjustment`, `inventory.current_stock`, `inventory.running_balance`.

---

## Client App
- **No UI changes** required.
- Continues to consume `ProductDTO` with `stock` returned.
- Server ensures `stock` is computed from transactions.

---

## Security & Permissions
- Inventory endpoints restricted to `ADMIN` / `MANAGER`.
- Prevent negative stock on `OUT`.
- Optionally log `createdById` from auth context.

---

## Testing Plan
**Unit**
- Service: `addTransaction` prevents negative stock.
- Service: sum logic IN/OUT/ADJUSTMENT.
- Repository: grouping & pagination.

**Integration**
- Create product → opening balance → IN → OUT → ADJUSTMENT → verify computed stock & ledger pages.

**E2E**
- Admin: create IN transaction (refill) and see stock increase.
- Attempt OUT beyond stock → expect 400 with error.

---

## Rollout Plan
1. Merge schema + run migration in staging.
2. Backfill opening balance script.
3. Update servers to compute `stock` from transactions.
4. Release Admin Inventory page.
5. Freeze any legacy direct writes to `Product.stock`.
6. Monitor: add logging on `OUT` failures; export a daily low-stock report (future).

---

## Edge Cases
- Race conditions: Wrap `OUT` checks & creation in a **transaction** if necessary with serializable isolation or use a **row-level lock** if DB supports it.
- Adjustments: Allow negative or positive? **We use positive quantity with explicit `ADJUSTMENT`** meaning add/subtract? To keep it simple: `ADJUSTMENT` **adds** to balance (positive). For subtractions, prefer `OUT`.
- Deleting transactions: **Not supported** initially (auditable ledger). If needed, add a reversing transaction.

---

## Acceptance Criteria
- [ ] `GET /products` returns products with accurate `stock` computed from transactions.
- [ ] `POST /inventory/transactions` creates IN/OUT/ADJUSTMENT, validates quantity > 0.
- [ ] `GET /inventory/:productId/transactions` returns paginated ledger.
- [ ] Admin Inventory page supports listing, viewing ledger, and creating transactions.
- [ ] Client product screens show `stock` unchanged (read-only).
- [ ] Backfill script runs successfully and preserves previous stock as opening balance.

---

## Nice-to-Have (later)
- Low stock alerts & scheduled reports.
- CSV export of ledger.
- Bulk transactions (CSV upload).
- Per-warehouse stock.
- Webhooks for stock changes.

---

## Dev Notes
- Ensure `products.controller.ts` is the **single source** for computed stock (service call).
- Remove any legacy paths that update `product.stock` directly.
- Keep transactions **idempotent** only when your `reference` is unique (optional).
- Add indices on `(productId, createdAt)` for ledger queries.

---

**End of Agent.MD**

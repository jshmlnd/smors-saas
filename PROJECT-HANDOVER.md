# SMORS Collection — Project Handover

Complete technical and operations handover for the SMORS Collection e-commerce platform
(thrifted/pre-loved fashion storefront + restoration/customs service intake + admin back office).

> Companion doc: [`DEPENDENCIES.md`](./DEPENDENCIES.md) — step-by-step checklist for moving the
> hosting accounts (Cloudflare, MongoDB, Render, Cloudinary) into the owner's name.
> This file covers everything else.

---

## 1. What this project is

A two-part web application:

| Part | Route | Who uses it |
|---|---|---|
| **Storefront** | `/` | Customers browse shop, add to cart, checkout with proof-of-payment upload, track orders, submit resto/custom requests |
| **Admin back office** | `/admin` | Owner manages products, reviews orders & payments, sets J&T tracking numbers, processes service requests |

Business context: single-owner thrift shop in Polangui, Philippines. Payments are manual
(GCash / BDO / BPI transfers verified by screenshot), shipping is J&T Express or seller
door-to-door. There is **no online payment gateway** — the admin confirms each order manually.

---

## 2. Tech stack

**Frontend** (`client/`)
- React 19 + Vite 6, React Router 7 (SPA)
- Tailwind CSS v4 + DaisyUI 5 (custom dark theme `smorsdark`)
- Zustand (cart, wishlist, UI/session, auth, order-history stores)
- Framer Motion (animations), lucide-react (icons), axios
- Hosted on **Cloudflare Workers** static assets (SPA mode) via `client/wrangler.jsonc`

**Backend** (`server/`)
- Node.js 22 (see `.nvmrc`), Express 5, Mongoose 8 (MongoDB)
- JWT admin auth (`jsonwebtoken`), helmet, CORS allow-list, compression, morgan
- Rate limiting: 240 req/min per IP on all of `/api`, 10 attempts / 15 min on `/api/auth/login`
- File uploads via multer → **Cloudinary** if configured, otherwise local disk `server/uploads/`
- Hosted on **Render** (free web service, Blueprint: `render.yaml`, health check `/api/health`)

**Database**
- MongoDB Atlas cluster `smors-data-collection` (local `mongod` also works for dev)

---

## 3. Repository layout

```
smors-collection/
├── client/                     # React SPA
│   ├── src/
│   │   ├── components/         # product card, home sections, layout, ui primitives
│   │   ├── pages/              # Home, Shop, ProductDetail, Cart, Checkout,
│   │   │                       # Order, TrackOrder, Services, AdminLogin
│   │   ├── pages/admin/        # AdminDashboardPage + Orders/Products/Requests panels
│   │   ├── store/              # zustand stores (cart, wishlist, auth, ui, orderHistory)
│   │   └── lib/
│   │       ├── api.js          # axios instance (auth + session headers, HTML-guard)
│   │       ├── constants.js    # ★ business config: payment accounts, shipping, statuses
│   │       └── session.js      # anonymous customer session id (x-session-id)
│   └── wrangler.jsonc          # Cloudflare Workers deploy config (assets → dist/)
├── server/                     # Express API
│   └── src/
│       ├── models/             # Product, Order, ServiceRequest, CustomerSession, AdminUser
│       ├── controllers/        # productController, orderController, serviceRequestController,
│       │                       # uploadController, sessionController, authController
│       ├── routes/             # /auth /products /orders /service-requests /uploads /session
│       ├── middleware/         # requireAdmin, multer upload, error handler
│       ├── config/             # env.js (★ shipping fees), db.js, cloudinary.js
│       ├── utils/              # storage (cloudinary/local), cloudUpload, ids, helpers
│       └── seed/seed.js        # admin + demo product seeder
├── render.yaml                 # Render blueprint (API service)
└── .nvmrc                      # Node 22
```

★ marks files the owner will edit most often (see §9).

---

## 4. Deployment architecture

```
Browser
  │  https://smors-collection.<subdomain>.workers.dev   (or custom domain)
  ▼
Cloudflare Workers (static SPA assets from client/dist)
  │  /api/* proxied by VITE_API_URL at build time
  ▼
Render web service "smors-api"  (node server/src/index.js)
  │                    │
  ▼                    ▼
MongoDB Atlas     Cloudinary (product photos, payment proofs, service images)
```

- **Client deploys**: `cd client && npm run build && npx wrangler deploy`
- **Server deploys**: push to GitHub → Render auto-deploys the branch connected in the dashboard
  (Blueprint defined in `render.yaml`; free plan sleeps after ~15 min idle — first request is slow)
- The API can also self-host the built client in production if `client/dist` exists next to it
  (`server/src/app.js`), but the current setup uses Cloudflare instead.

---

## 5. Local development

Prerequisites: Node 22, MongoDB running locally (or an Atlas URI).

```bash
# 1. install everything
npm run install:all          # installs server + client deps

# 2. configure environment (see §6)
cp server/.env               # create server/.env with your values

# 3. seed database (admin account + 18 demo products)
npm run seed                 # use -- prefix args: npm run seed -- --fresh to reset products

# 4. run API + Vite dev server together (API :5000, web :5173)
npm run dev
```

- Storefront: http://localhost:5173
- Admin login: http://localhost:5173/admin/login
- API health: http://localhost:5000/api/health → `{ ok, db, cloudinary, uptime }`

Default seeded admin (dev only): `admin@smors.ph` / `SmorsAdmin#2026` —
comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars; **change them before any real deployment**.

---

## 6. Environment variables

### Server — `server/.env` (gitignored; also set in Render dashboard)

| Key | Required | Notes |
|---|---|---|
| `NODE_ENV` | – | `production` enables morgan combined logs + optional static client serving |
| `PORT` | – | Defaults 5000 (Render injects its own) |
| `MONGO_URI` | ✅ | Atlas connection string |
| `JWT_SECRET` | ✅ | Signs admin tokens (7-day expiry). Generate: long random string |
| `CLIENT_ORIGINS` | ✅ (prod) | Comma-separated allow-list, e.g. `https://your-domain.com,https://smors-collection.workers.dev`. Empty = reflect any origin (dev convenience) |
| `ADMIN_EMAIL` | ✅ | Login email (also used by seeder) |
| `ADMIN_PASSWORD` | ✅ | Login password (also used by seeder) |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | Without these three, uploads fall back to **local disk** (data loss risk on Render — see §11) |
| `CLOUDINARY_API_KEY` | ⚠️ | |
| `CLOUDINARY_API_SECRET` | ⚠️ | |

Shipping fees are **hardcoded** in `server/src/config/env.js`:

```js
export const SHIPPING = { jt: 150, door2door: 120, FREE_THRESHOLD: 3500 }
```

### Client — build-time variable (set in Cloudflare dashboard or `.env` during builds)

| Key | Notes |
|---|---|
| `VITE_API_URL` | Full API base URL, e.g. `https://smors-api.onrender.com/api`. Falls back to `/api` (same-origin) |

---

## 7. Data models (MongoDB)

| Collection | Key fields |
|---|---|
| `products` | name, slug, brand, category (7 enums), condition, price, compareAtPrice, sizes[], tags[], images[], stock, featured, status(active/archived) |
| `orders` | refCode `SMR-XXXXXXXXX`, items[] (denormalized snapshot), customer{name,phone,address…}, shippingMethod (`jt`/`door2door`), shippingFee, **trackingNumber** (J&T waybill), paymentMethod (`gcash`/`bdo`/`bpi`), paymentProofUrl, paymentRefNo, subtotal, total, status, restocked, statusHistory[] |
| `servicerequests` | refCode, type (cap/shoe × restoration/custom/other), name, contact, description, budget, images[], status |
| `customersessions` | `_id` = device session id; cart[], wishlist[], orders[] snapshot; TTL index expires after 180 days of inactivity |
| `adminusers` | email, bcrypt passwordHash |

Order status lifecycle:
`payment_review → confirmed → shipped → delivered`, plus `cancelled`.
Cancelling **automatically restocks** item inventory exactly once (`restocked` flag).

Service request lifecycle:
`received → quoting → in_progress → ready → completed` (or `declined`).
Open requests = anything not `completed`/`declined`.

---

## 8. API surface (all under `/api`)

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /health` | – | DB/Cloudinary status probe (used by Render) |
| `POST /auth/login` | limiter | Admin login → JWT |
| `GET /auth/me` | admin | Token check |
| `GET /products` | – | List/filter/search (public hides archived) |
| `GET /products/:slug` | – | Product detail |
| POST/PUT/DELETE `/products…` | admin | CRUD + archive toggle |
| `POST /orders` | – | Create order (validates stock, computes totals server-side) |
| `GET /orders/ref/:ref` | – | Public order lookup by reference code |
| `POST /orders/track` | – | Batch status poll for saved orders |
| `GET /orders` | admin | List all orders |
| `PUT /orders/:id/status` | admin | Advance/cancel status (auto-restock on cancel) |
| `PUT /orders/:id/tracking` | admin | Set/clear J&T tracking number (**J&T orders only**) |
| `GET /service-requests` | admin | List requests |
| `POST /service-requests` | – | Public submission (max 4 images) |
| `PUT /service-requests/:id` | admin | Update status/note |
| `POST /uploads/:kind` | mixed | Image upload → returns URLs (`product` admin-only; `payment-proof`, `service` public) |
| `GET /uploads/status` | – | Reports `cloudinary` vs `local-disk` mode |
| `POST/DELETE /session` | – | Anonymous cart/wishlist/history sync |

Client-side conventions worth knowing:
- Admin token stored in `localStorage.smors-admin`, sent as `Bearer` header; a 401 response
  auto-logs-out and redirects `/admin/*` pages to `/admin/login`.
- Every request carries `X-Session-Id` so carts/wishlists survive across visits on one device.

---

## 9. Where to change common things (cheat-sheet)

All business configuration lives in **two files** that must stay in sync:

### `client/src/lib/constants.js`
- `PAYMENT_METHODS` — GCash/BDO/BPI **account names & numbers** shown at checkout
- `SHIPPING_METHODS` — labels, ETA text, fees *displayed* to customers
- `FREE_SHIPPING_THRESHOLD` — ₱3,500 banner + fee waiver
- Categories, conditions, status label/tone maps, socials, brand info

### `server/src/config/env.js`
- `SHIPPING` — the fees actually **charged and stored** on orders (`jt`, `door2door`, `FREE_THRESHOLD`)

> ⚠️ **Known mismatch (fix before going live):** the client advertises J&T ₱120 and
> Door-to-Door FREE, while the server charges J&T ₱150 and Door-to-Door ₱120.
> A customer can see “FREE” at checkout yet be billed ₱120 in their order total.
> Align one of the files — recommended source of truth is the **server**, then copy those
> numbers into `constants.js`.

Other frequent edits:
- Change admin password → update `ADMIN_PASSWORD` in Render + re-run seeder **or** add a
  password-change flow (none exists today); tokens are stateless so old ones stay valid until
  expiry — rotate `JWT_SECRET` to force logout everywhere.
- Homepage hero pulls the latest featured products automatically — no code edits needed.
- Services page photos are self-hosted under `client/public/img/`.

---

## 10. Admin dashboard guide

Open `/admin/login`, sign in with the admin credentials.

**Orders tab**
- New orders arrive in `Payment Review`. Click a row to expand: ship-to address, items,
  breakdown, payment reference, proof-of-payment link.
- Verify the customer's GCash/bank transfer against the uploaded proof, then move status:
  `Payment Review → Confirmed → Shipped → Delivered`.
- For **J&T Express** orders, enter the waybill in the *“J&T tracking no.”* field inside the
  expanded row and press **Save** — customers immediately see it on their order page with a
  copy button. Non-J&T orders reject tracking numbers by design.
- Cancelling an order restores product stock automatically.
- The Orders tab shows a red counter badge with orders awaiting payment review; Requests shows
  amber for open requests. Lists and badges refresh automatically every ~10 seconds — no page reload.
- Search filters by reference code / customer name / mobile.

**Products tab** — create/edit/archive listings, upload photos, manage sizes/stock,
toggle `featured` (feeds homepage hero + Featured Drops section).

**Requests tab** — resto & custom submissions from the Services page; move through the
status pipeline, open attached reference photos, contact the customer via the linked
Messenger/tel link.

Stats row across the top: confirmed revenue (paid & fulfilled), total orders, active+archived
listings, open requests.

---

## 11. Known limitations & gotchas

1. **Upload storage fallback** — without Cloudinary keys, uploads go to `server/uploads/`,
   which is **ephemeral on Render** (wiped on every deploy/restart). Payment proofs and product
   photos would vanish. Always configure Cloudinary in production; check `/api/health` →
   `cloudinary: true`.
2. **Shipping fee mismatch** — see §9. Fix before launch.
3. **Free Render plan sleeps** — first visit after ~15 min idle takes 30–60 s to wake;
   checkout during cold-start may need a retry.
4. **No password reset flow** — admin password changes require env var + reseed (or manual DB edit).
5. **Manual payments** — nothing prevents fake proof uploads; verification is human by design.
6. **Stock race window** — stock decrements are optimistic `$inc`s; heavy simultaneous buying
   of a single-piece item could oversell by a small margin (acceptable for this volume).
7. Seed data overwrites the admin collection (`AdminUser.deleteMany`) every time you run
   `npm run seed` — don't run it against production carelessly.

---

## 12. Ownership transfer checklist

Detailed click-by-click for steps 1–2 lives in [`DEPENDENCIES.md`](./DEPENDENCIES.md).

1. **GitHub** — transfer repo `jshmlnd/smors-saas` (Settings → Danger Zone → Transfer) or add
   owner as collaborator. Render + Cloudflare deployments follow the repo connection.
2. **MongoDB Atlas** — invite owner to the `smors-data-collection` project as Project Owner,
   then remove developer. Rotate database user password afterwards.
3. **Render** — Transfer workspace ownership (Workspace Settings → Transfer) or invite owner;
   update `MONGO_URI`, `JWT_SECRET` (rotate!), admin creds in the service's Environment tab.
4. **Cloudflare** — invite owner to the Workers account / transfer zone if a custom domain is
   used; rebuild once with correct `VITE_API_URL`.
5. **Cloudinary** — share credentials, then owner rotates API secret inside their own account.
6. **Rotate every secret after transfer**: `JWT_SECRET`, `ADMIN_PASSWORD`, Mongo user password,
   Cloudinary keys. Old tokens die when `JWT_SECRET` changes.
7. **Domain** (if purchased) — move DNS to owner's Cloudflare account.

Post-transfer smoke test: place a test order end-to-end (upload proof, verify in admin,
set J&T tracking, cancel to confirm restock).

---

## 13. Quick reference

| Task | Command |
|---|---|
| Install all deps | `npm run install:all` |
| Run everything locally | `npm run dev` |
| Seed/reset demo data | `npm run seed` / `npm run seed -- --fresh` |
| Production client build | `npm run build` (outputs `client/dist`) |
| Deploy client | `cd client && npx wrangler deploy` |
| Deploy server | push to GitHub (Render watches branch) |
| Health check | `GET /api/health` |
| Manual API run | `npm run dev:server` |

*Document generated 2026-08-26 · branch `main` @ `1dbc22e`*

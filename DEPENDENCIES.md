# SERVER HANDOVER DEPENDENCIES

To hand over the server successfully, I need to move the website's code, database, and domain control from my personal developer accounts to accounts owned by you. Since my current URL shows I am using Cloudflare Workers (.workers.dev), the process is highly streamlined and completely free for a small-scale shop. Follow my step-by-step checklist to safely transfer ownership without breaking the live website.

> Read this together with [`PROJECT-HANDOVER.md`](./PROJECT-HANDOVER.md) — it explains how the
> app works. This file is only the account/account-transfer checklist.

### Step 1: Setting Up Your Accounts

You must own the accounts hosting the business data.

1. Signup for a free Cloudflare Account [here](https://cloudflare.com/) or https://cloudflare.com/

2. Signup for a free MongoDB Account [here](https://www.mongodb.com/) or https://www.mongodb.com/

### Step 2: Database and Environment Migration

Before moving the code, you must replicate my backend environment.

1. Inside MongoDB press `New Project` → `Enter project name` → `Press next` → `Create Project`

2. Create a cluster by pressing `Create Cluster` after creating a project → Select `Free Plan` and name your Cluster → Press `Create Deployment`

To connect database to website:

1. Inside cluster press `Connect` → `Drivers` → Copy the MongoDB URI → Press `Done`

2. Paste URI inside Render `Environment Variables` `MONGO_URI` = `YOUR-MONGO-URI`

3. While you are in Render `Environment Variables`, fill in the rest of the keys (names must match exactly):

   | Key | What to put |
   |---|---|
   | `JWT_SECRET` | Any long random text (this signs admin logins). Example generator: type random letters/numbers, 40+ characters |
   | `CLIENT_ORIGINS` | Your storefront address(es), comma-separated — e.g. `https://smors-collection.workers.dev` (add your real domain here later when you buy one) |
   | `CLOUDINARY_CLOUD_NAME` | From Step 3 below |
   | `CLOUDINARY_API_KEY` | From Step 3 below |
   | `CLOUDINARY_API_SECRET` | From Step 3 below |

4. After saving all variables press `Manual Deploy` → `Deploy latest commit` so the API restarts with the new values.

5. Verify the API is healthy: open `https://YOUR-API-URL.onrender.com/api/health` in your browser. It should answer `{"ok":true,"db":true,...}`. If `db` is `false`, the `MONGO_URI` is wrong (usually a missing password or an IP allowlist issue — in MongoDB Atlas go to `Network Access` → `Add IP Address` → `Allow Access From Anywhere`).

### Step 3: Cloudinary Setup (image storage)

Product photos, payment-proof screenshots, and service-request photos are stored in Cloudinary. Without these three keys the site still works but images are saved on a temporary disk and **disappear every time the server redeploys** — do not skip this step.

1. Signup for a free Cloudinary Account [here](https://cloudinary.com/) → `Sign Up for Free`

2. After signup you land on the Dashboard → find the `Product Environment Credentials` box (or go to `Settings` → `API Keys`)

3. Copy three values into the Render `Environment Variables` from Step 2:
   - `Cloud name` → `CLOUDINARY_CLOUD_NAME`
   - `API Key` → `CLOUDINARY_API_KEY`
   - `API Secret` → `CLOUDINARY_API_SECRET` (press the eye icon to reveal)

4. Redeploy the API again (`Manual Deploy` → `Deploy latest commit`) and check `/api/health` — it should now report `"cloudinary": true`.

### Step 4: Moving Your Data to the New Cluster

Your new Atlas cluster starts empty. Two options:

**Option A — keep the current data (recommended):** copy everything over once.

On any computer with Node installed:

```bash
# export from my cluster (I will give you the old URI + credentials privately)
mongodump --uri="OLD-MONGO-URI" --archive=smors-backup.archive

# import into YOUR cluster
mongorestore --uri="YOUR-MONGO-URI" --archive=smors-backup.archive
```

**Option B — start clean:** run the seeder against your new cluster. It creates your admin login and 18 sample products (you then delete them in the Products tab as you list real items).

```bash
npm run install:all
# put YOUR-MONGO-URI, your ADMIN_EMAIL and ADMIN_PASSWORD inside server/.env first
npm run seed
```

Test right away: log into the admin dashboard with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. If Option B was used on an empty cluster, this login works immediately; if Option A was used, logins are whatever was in the old database — change the password next (Step 6).

### Step 5: Transfer the Hosting Accounts to You

1. **Render** (runs the API): from my Render dashboard → `Team settings` → invite your email as a member, then transfer the workspace/project to you → you remove me afterwards. Double-check the `Environment Variables` tab survived the transfer.

2. **Cloudflare** (serves the website): from my Cloudflare dashboard → `Manage Account` → `Members` → invite your email → promote you to `Super Administrator`, then I leave / you remove me. If you bought a custom domain: in Cloudflare go to `Workers & Pages` → `smors-collection` → `Settings` → `Domains & Routes` → `Add` → attach your domain (Cloudflare sells domains directly if you don't have one yet).

3. **GitHub** (the code itself): repository `jshmlnd/smors-saas` → `Settings` → `Collaborators` (add you) or `Danger Zone` → `Transfer ownership` (makes you the owner). Render and any future automation should then be re-connected to the repo under your account: Render `Settings` → `Repo` → disconnect/reconnect with your GitHub.

### Step 6: Rotate Every Secret

After the transfers above I could technically still see secrets, so we rotate them — you keep the site online by updating both sides at once.

1. In Render, change `JWT_SECRET` to a new random value → redeploy. (This logs out any admin sessions — expected.)

2. Change `MONGO_URI` password: Atlas → `Database Access` → edit the database user → `Edit Password` → update `MONGO_URI` in Render with the same password → redeploy.

3. In Cloudinary: `Settings` → `API Keys` → `Generate New API Secret` → update the three `CLOUDINARY_*` variables in Render → redeploy.

4. Log into the admin dashboard → confirm it works. To change the admin login email/password: update `ADMIN_EMAIL` / `ADMIN_PASSWORD` in Render, then re-run the seed command from Step 4 Option B **against production** (careful: `--fresh` would wipe the product list — plain `npm run seed` only resets the admin user).

5. If your storefront URL ever changes, update `CLIENT_ORIGINS` in Render (otherwise the shop cannot talk to the API — browsers will block it), and rebuild the storefront with the correct `VITE_API_URL` pointing at the API (see Step 7).

### Step 7: Publish the Website Under Your Cloudflare

The public site is deployed from the `client/dist` folder with Wrangler. Once your Cloudflare account owns the project:

```bash
cd client
# point the build at the API (use your own Render URL, keep /api at the end)
set VITE_API_URL=https://YOUR-API-URL.onrender.com/api      # Windows CMD
npm install
npm run build
npx wrangler login                                          # opens browser, log in with YOUR Cloudflare
npx wrangler deploy
```

(Mac/Linux use `export VITE_API_URL=...` instead of `set`.) Afterwards open your `.workers.dev` URL — or your custom domain — and the storefront should load exactly as before.

### Step 8: Final Smoke Test

Do this end-to-end once, before I remove my access:

1. Storefront loads, products show photos (proves Cloudinary works).
2. Add to cart → checkout → upload a payment screenshot → submit. Note the `SMR-XXXXXXX` reference.
3. Log into `/admin` → order appears within ~10 seconds without refreshing (live queue).
4. Open the order row → set status to `Confirmed` → enter a J&T tracking number → `Save`.
5. On another device/browser, open `/track`, enter the reference → status shows `Confirmed`; open the order page → tracking number visible with copy button.
6. Services page → submit a restoration request with a photo → appears in the Requests tab.
7. Cancel the test order in admin → product stock goes back up automatically.
8. Delete the test order data if desired (or keep it — harmless).

Once all eight pass, the handover is complete: you now own the code, the database, the hosting, and the domain — and I retain nothing.

---

*Quick reference of what runs where:*

| Thing | Service | Where to manage |
|---|---|---|
| Storefront (website) | Cloudflare Workers | Cloudflare → `Workers & Pages` → `smors-collection` |
| API / back end | Render web service `smors-api` | Render → `smors-api` → `Environment Variables` |
| Database | MongoDB Atlas free cluster | Atlas → your project → `Cluster` |
| Images | Cloudinary free plan | Cloudinary → `Media Library` / `Settings` |
| Source code | GitHub `jshmlnd/smors-saas` | GitHub → repo `Settings` |

*Last updated 2026-08-26.*

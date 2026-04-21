# Decise – Backend API

Node.js / Express backend for the Decise fintech platform (NZ open banking via Akahu).  
The database layer was migrated from **AWS DynamoDB → PostgreSQL** using **Prisma ORM**.

---

## Table of contents

1. [Requirements](#requirements)
2. [Local development setup](#local-development-setup)
3. [Environment variables](#environment-variables)
4. [Database migration guide](#database-migration-guide)
5. [Deploying to Railway ⭐ recommended](#deploying-to-railway)
6. [Deploying to Render (backend) + Neon (database)](#deploying-to-render-backend--neon-database)
7. [Deploying the Angular frontend to Vercel](#deploying-the-angular-frontend-to-vercel)
8. [Building the Angular frontend](#building-the-angular-frontend)
9. [Useful npm scripts](#useful-npm-scripts)
10. [Project structure](#project-structure)
11. [Security notes](#security-notes)

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | **20.x LTS** — run `nvm use` to auto-select (`.nvmrc` is included) |
| npm | 9+ |
| PostgreSQL | **15+** — local, or any hosted provider (Supabase, Neon, Railway, Render, AWS RDS) |

---

## Local development setup

```bash
# 1. Install Node dependencies
npm install --legacy-peer-deps

# 2. Create your local .env file
cp .env.example .env
#    → Edit .env and fill in all required values (see section below)

# 3. Generate the Prisma client from the schema
npx prisma generate

# 4. Create the database tables (first run)
npx prisma migrate dev --name init

# 5. Start the development server (auto-restarts on file changes)
npm run nodemon
```

The API is now available at `http://localhost:30001` (default port, set in `config/development.json`).

---

## Environment variables

Copy `.env.example` to `.env` and fill in every value before starting the server.  
**Never commit `.env` to version control** — it is listed in `.gitignore`.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` \| `staging` \| `production` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string — `postgresql://USER:PASS@HOST:PORT/DB?schema=public` |
| `JWT_TOKEN_KEY` | ✅ | Long random string used to sign JWTs |
| `COOKIE_PRIVATE_KEY` | ✅ | Long random string for session cookie encryption |
| `ENCRYPTION_KEY` | ✅ | **Exactly 32 characters** — used for AES-256-CBC field encryption |
| `AWS_ACCESS_KEY_ID` | ✅ | IAM key for S3 file uploads |
| `AWS_SECRET_ACCESS_KEY` | ✅ | IAM secret for S3 file uploads |
| `AWS_REGION` | ✅ | S3 bucket region (e.g. `eu-north-1`) |
| `AWS_S3_BUCKET` | ✅ | S3 bucket name (e.g. `desicefilesupload`) |
| `AKAHU_APP_TOKEN` | ✅ | Akahu open-banking app token |
| `AKAHU_APP_SECRET` | ✅ | Akahu open-banking app secret |
| `MAIL_HOST` | ✅ | SMTP host |
| `MAIL_PORT` | ✅ | SMTP port (e.g. `587`) |
| `MAIL_SECURE` | ✅ | `true` for port 465, `false` otherwise |
| `MAIL_ID` | ✅ | Sender email address |
| `MAIL_PASSWORD` | ✅ | SMTP password / app password |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ (push) | Contents of `serviceAccountKey.json` as a single-line JSON string |
| `LOG_LEVEL` | — | Pino log level (default: `info` in production, `debug` in dev) |

> **Tip — generate secrets quickly:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Database migration guide

The app uses **Prisma Migrate** to manage the PostgreSQL schema.  
All 23 models are defined in `prisma/schema.prisma`.

### Running migrations

| Scenario | Command |
|---|---|
| First-time local setup | `npx prisma migrate dev --name init` |
| After pulling schema changes | `npx prisma migrate dev` |
| Apply migrations in **production** | `npm run db:migrate` (runs `prisma migrate deploy`) |
| Reset the local database (⚠️ destroys data) | `npx prisma migrate reset` |
| Regenerate Prisma client after schema change | `npx prisma generate` |

### Opening the visual database editor (Prisma Studio)

```bash
npm run db:studio
# Opens http://localhost:5555 — browse and edit all tables in a browser UI
```

### Migrating from DynamoDB (historical context)

The database was migrated from AWS DynamoDB. The `ModelBase` class (`common/model/modelBase.js`) still exposes the original callback-style API (`findOne`, `insert`, `updateData`, `delete`, etc.) so that all existing controllers continue to work unchanged — but it now calls Prisma under the hood instead of DynamoDB.

**DynamoDB table → Prisma model mapping:**

| DynamoDB table | Prisma model |
|---|---|
| `Admin-User` | `AdminUser` |
| `Admin-Accounts` | `AdminAccount` |
| `Akahu-Users` | `AkahuUser` |
| `Akahu-User-Account` | `AkahuUserAccount` |
| `Custom-Auto-Payments` | `AutoPayment` |
| `Inquiry-Registration` | `InquiryRegistration` |
| `Split_Payment` | `SplitPayment` |
| `Split_Payment_Order` | `SplitPaymentOrder` |
| `Split_Payment_History` | `SplitPaymentHistory` |
| `Payment_Category` | `SplitPaymentCategory` |
| `Payment_Transaction` | `PaymentTransaction` |
| `Admin_Payment_Transaction` | `AdminPaymentTransaction` |
| `Support-Ticket` | `SupportTicket` |
| `Support-Ticket-Category` | `SupportTicketCategory` |
| `Support-Ticket-Transaction` | `SupportTicketTransaction` |
| `financial-Goals` | `FinancialGoal` |
| `Monitization-Module` | `Monitization` |
| `Notification` | `Notification` |
| `deviceToken` | `DeviceToken` |
| `News-Letter-Subscription` | `NewsLetterSubscription` |
| `Verification-Code` | `VerificationCode` |
| `Webhook` | `Webhook` |
| `Error-Logs` | `ErrorLog` |

---

## Deploying to Railway

Railway is the **recommended** hosting platform — it provides managed PostgreSQL, GitHub auto-deploy, and simple environment variable management.

### Step-by-step

1. **Create a Railway account** at [railway.app](https://railway.app) and connect your GitHub.

2. **Create a new project** → "Deploy from GitHub repo" → select `stewartDMS/DesiceTech`.

3. **Set the root directory** to `vidhaninfotech-decise` (where `package.json` lives).

4. **Add a PostgreSQL database**  
   In your Railway project: **New** → **Database** → **Add PostgreSQL**.  
   Railway automatically injects `DATABASE_URL` into your service.

5. **Add environment variables**  
   In your service → **Variables** tab, add every variable from the table above (except `DATABASE_URL` — Railway sets that automatically):

   ```
   NODE_ENV=production
   JWT_TOKEN_KEY=<generate with crypto command above>
   COOKIE_PRIVATE_KEY=<generate>
   ENCRYPTION_KEY=<exactly 32 chars>
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=eu-north-1
   AWS_S3_BUCKET=desicefilesupload
   AKAHU_APP_TOKEN=...
   AKAHU_APP_SECRET=...
   MAIL_HOST=...
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_ID=...
   MAIL_PASSWORD=...
   FIREBASE_SERVICE_ACCOUNT_JSON=...
   ```

6. **Railway uses `railway.toml`** — the build and start commands are already configured:
   ```toml
   [build]
   builder = "nixpacks"

   [deploy]
   startCommand = "npm run start"
   ```

   > **Important:** Add a `postinstall` or custom build command to run Prisma migrations.  
   > In Railway's service settings → **Build Command**, set:
   > ```
   > npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy
   > ```

7. **Deploy** — Railway triggers a build on every push to your connected branch.

8. **Verify** by visiting the Railway-provided URL. The API root serves the Angular frontend.

---

## Deploying to Render (backend) + Neon (database)

The backend (`desice-api`) is deployed to Render as a Node.js Web Service.  
The PostgreSQL database is hosted on **[Neon](https://neon.tech)** — a serverless PostgreSQL provider with a generous free tier and automatic SSL.

`render.yaml` is pre-configured with `rootDir: vidhaninfotech-decise` so Render runs everything from the correct folder inside this monorepo.

### Step 1 — Create the Neon database

1. Sign up at [neon.tech](https://neon.tech) and create a new project (e.g. `desice`).
2. In the Neon dashboard → your project → **Connection Details**, select the **Pooled connection** string.  
   It looks like:
   ```
   postgresql://user:password@ep-quiet-forest-123456.eu-central-1.aws.neon.tech/desice?sslmode=require
   ```
3. Copy this string — you'll paste it into Render as `DATABASE_URL`.

> **Tip:** Use the **pooled** connection string (PgBouncer) for production to avoid connection exhaustion under load.

### Step 2 — Deploy on Render via Blueprint

1. **Create a Render account** at [render.com](https://render.com) and connect your GitHub.

2. **New** → **Blueprint** → select the `stewartDMS/DesiceTech` repository.  
   Render reads `render.yaml` and automatically creates:
   - A **Web Service** (`desice-api`) with `rootDir` set to `vidhaninfotech-decise`

3. **Set environment variables**  
   When the Blueprint import asks for `DATABASE_URL` (it is marked `sync: false` — meaning Render won't generate it), paste the Neon connection string from Step 1.  
   Then add the remaining secrets in the Render dashboard → your service → **Environment**:

   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/desice?sslmode=require
   ENCRYPTION_KEY=<exactly 32 chars>
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=eu-north-1
   AWS_S3_BUCKET=desicefilesupload
   AKAHU_APP_TOKEN=...
   AKAHU_APP_SECRET=...
   MAIL_HOST=...
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_ID=...
   MAIL_PASSWORD=...
   FIREBASE_SERVICE_ACCOUNT_JSON=...
   ```

   `JWT_TOKEN_KEY` and `COOKIE_PRIVATE_KEY` are auto-generated by Render.

4. **Deploy** — Render runs the build command from `render.yaml`:
   ```
   npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy
   ```
   This installs dependencies, generates the Prisma client, and applies all pending migrations against your Neon database automatically.

5. **Verify** by visiting your Render service URL (e.g. `https://desice-api.onrender.com`).

### Root directory note

Because the repo is a monorepo (`vidhaninfotech-decise/` is the backend root), `render.yaml` sets `rootDir: vidhaninfotech-decise`.  
Render runs **all** commands (install, build, start) relative to that subdirectory — no extra configuration needed in the dashboard.

---

## Deploying the Angular frontend to Vercel

The Angular SPA lives in `frontend/` and is configured for Vercel via `frontend/vercel.json`.  
Deploy it as a **separate Vercel project** while the Express API stays on Railway or Render.

### How it works

- **`frontend/vercel.json`** tells Vercel:
  - Install: `npm install --legacy-peer-deps`
  - Build: `node scripts/set-env.js && npm run build`
  - Output: `dist/decise_development`
  - Rewrite all routes → `index.html` (required for Angular Router)
- **`frontend/scripts/set-env.js`** runs before `ng build` and writes `environment.prod.ts` from the Vercel environment variables below.

### Step-by-step

1. **Create a Vercel account** at [vercel.com](https://vercel.com) and install the [Vercel CLI](https://vercel.com/docs/cli) (optional).

2. **Import the project in Vercel**  
   - Go to **Add New Project** → import `stewartDMS/DesiceTech`  
   - Set **Root Directory** to `vidhaninfotech-decise/frontend`  
   - Vercel auto-detects `vercel.json` — no further framework settings needed.

3. **Set environment variables** in the Vercel dashboard → your project → **Settings → Environment Variables**:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | URL of your deployed API — e.g. `https://your-app.railway.app/v1/` |
   | `VITE_UPLOADS_URL` | e.g. `https://your-app.railway.app/uploads/` |
   | `VITE_UPLOAD_FILE` | AWS Lambda upload endpoint (optional, defaults to the existing value) |

   > **Tip:** if the API is on the same domain (custom domain with a reverse proxy), `VITE_API_URL` can stay as `https://desice.co.nz/v1/`.

4. **Deploy** — Vercel triggers a build on every push to the connected branch.  
   The deploy log will show `[set-env] environment.prod.ts written` confirming the URL injection.

5. **Verify** — visit your Vercel-provided URL (e.g. `https://decise.vercel.app`).  
   All routes (including deep links) should resolve to the Angular app.

### CORS

Because the Angular frontend is now on a different origin from the Express API, add the Vercel domain to the CORS allowlist in the backend (`web/middleware.js`):

```js
// web/middleware.js — add your Vercel domain:
const allowedOrigins = [
  'https://decise.vercel.app',
  'https://decise.co.nz',  // custom domain if set
];
```

---

## Building the Angular frontend

The Angular app is in `frontend/`. The compiled output is served as static files by the Express backend (already wired up in `web/middleware.js`).

```bash
# Install Angular dependencies
npm run installAngularPackages

# Production build (output goes to frontend/dist/decise_development)
npm run angularBuild
```

The built files are then served by Express at the `/` route.  
In hosted environments (Railway/Render), run this build step before or during your deployment pipeline.

---

## Useful npm scripts

| Script | What it does |
|---|---|
| `npm run nodemon` | Start dev server with auto-restart |
| `npm run start` | Start production server (`NODE_ENV=production`) |
| `npm run db:migrate` | Apply pending Prisma migrations (`prisma migrate deploy`) |
| `npm run db:studio` | Open Prisma Studio visual DB editor on port 5555 |
| `npm run angularBuild` | Build Angular frontend for production |
| `npm run installNodePackages` | Install Node deps with legacy peer deps flag |
| `npm run installAngularPackages` | Install Angular deps |

---

## Project structure

```
vidhaninfotech-decise/
├── .env.example               ← copy to .env, fill in values
├── .nvmrc                     ← Node 20 LTS
├── railway.toml               ← Railway deployment config
├── render.yaml                ← Render deployment config
├── prisma/
│   └── schema.prisma          ← Database schema (23 models)
├── config/
│   ├── index.js               ← Loads config + env vars; throws on missing secrets in prod
│   ├── all.json / development.json / production.json
│   └── firebase-config.js     ← Firebase init (reads from FIREBASE_SERVICE_ACCOUNT_JSON)
├── common/
│   ├── db/
│   │   └── prismaClient.js    ← Prisma singleton (one instance per process)
│   ├── model/
│   │   ├── modelBase.js       ← Base class with Prisma CRUD (callback-style API)
│   │   └── ...                ← One file per entity
│   ├── logger/
│   │   ├── pino.js            ← Structured JSON logger (use in new code)
│   │   └── index.js           ← Legacy logger (backward compat)
│   └── helper.js              ← Shared utilities (email, date helpers)
├── services/
│   └── security/              ← Business logic controllers
├── web/
│   ├── index.js               ← HTTP server entry point
│   ├── middleware.js          ← Express setup, auth, S3 upload, routing
│   └── routes/v1/             ← API route definitions
└── frontend/                  ← Angular SPA source
    ├── vercel.json            ← Vercel deployment config (build, output, SPA rewrites)
    └── scripts/set-env.js     ← Injects VITE_API_URL etc. into environment.prod.ts at build time
```

---

## Security notes

- **All secrets live in environment variables only** — no credentials in source code.
- In `production`, the server **throws an error at startup** if `JWT_TOKEN_KEY`, `COOKIE_PRIVATE_KEY`, or `ENCRYPTION_KEY` are missing or not set.
- The Firebase service account key is loaded from `FIREBASE_SERVICE_ACCOUNT_JSON` (a JSON string) — never commit `serviceAccountKey.json` to the repo.
- `.gitignore` blocks `.env`, `.env.*`, and `config/serviceAccountKey*.json`.
- The previously committed AWS keys, Akahu tokens, and SMTP passwords have been **rotated** — if you have copies of the old credentials, revoke them immediately.
- S3 bucket (`desicefilesupload`) — multer-s3 v3 removed per-upload ACL support. Configure a **bucket policy** in the AWS console if uploaded files need to be publicly readable.

---

*Last updated: April 2026*

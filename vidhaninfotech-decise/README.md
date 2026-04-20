# Decise – Backend API

Node.js / Express backend for the Decise fintech application (NZ open banking).

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | **20.x LTS** (use `nvm use` to pick up `.nvmrc`) |
| PostgreSQL | 15+ (or use Supabase / Neon / Railway managed Postgres) |
| npm | 9+ |

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Copy env template and fill in your values
cp .env.example .env
# Edit .env – set DATABASE_URL, JWT_TOKEN_KEY, AWS_*, AKAHU_* etc.

# 3. Generate the Prisma client
npx prisma generate

# 4. Run database migrations (creates all tables)
npx prisma migrate dev --name init

# 5. (Optional) Open the visual database editor
npx prisma studio

# 6. Start the development server
npm run nodemon
```

---

## Environment variables

See `.env.example` for the full list of required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_TOKEN_KEY` | Secret key for signing JWTs |
| `COOKIE_PRIVATE_KEY` | Secret for session cookies |
| `ENCRYPTION_KEY` | 32-character AES-256 key (field-level encryption) |
| `AWS_ACCESS_KEY_ID` | AWS credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 |
| `AKAHU_APP_TOKEN` | Akahu open-banking app token |
| `AKAHU_APP_SECRET` | Akahu open-banking app secret |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account JSON (stringified) |
| `MAIL_HOST` / `MAIL_ID` / `MAIL_PASSWORD` | SMTP email config |

---

## Database (PostgreSQL + Prisma)

- Schema defined in `prisma/schema.prisma`
- Run migrations: `npm run db:migrate`
- Open studio: `npm run db:studio`

---

## Deployment

### Railway (recommended)
1. Connect your GitHub repo in the Railway dashboard
2. Add a **PostgreSQL** plugin – Railway auto-sets `DATABASE_URL`
3. Add all other env vars under **Variables**
4. Railway picks up `railway.toml` for build & start commands

### Render
- `render.yaml` is included; push to GitHub and connect in Render

---

## Frontend (Angular)

```bash
npm run installAngularPackages
npm run angularBuild   # ng build --configuration production
```

The compiled output is served as static files from the Express backend.

---

## Project structure

```
├── common/
│   ├── db/prismaClient.js      # Prisma singleton
│   ├── model/                   # Prisma-backed model classes
│   ├── logger/pino.js           # Structured logger (new code)
│   └── logger/index.js          # Legacy logger (backward compat)
├── config/                      # App configuration (secrets via env)
├── prisma/schema.prisma         # Database schema (23 models)
├── services/                    # Business logic controllers
├── web/
│   ├── index.js                 # HTTP server entry point
│   ├── middleware.js            # Express middleware + routing
│   └── routes/                  # Express route definitions
└── frontend/                    # Angular SPA
```

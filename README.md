# Bensal Investment Co. Ltd. — Corporate Website

Production-ready corporate website and CMS foundation for **Bensal Investment Co. Ltd.**, built
with Next.js 15, Prisma, and PostgreSQL.

> **Status: Phase 1 of a multi-phase build.** This phase delivers the full public website
> (real company content, branding, animations, SEO), the database schema for every content
> domain, contact/quotation/career forms with email + file upload, and authentication
> scaffolding with one seeded admin account. The full admin **content management dashboard**
> (CRUD screens for every section) is Phase 2 — see "Roadmap" below.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion,
  Radix UI primitives, Recharts, TipTap (ready for Phase 2 admin editor)
- **Backend**: Next.js Server Actions, Prisma ORM 7
- **Database**: PostgreSQL
- **Auth**: NextAuth.js (credentials + bcrypt, JWT sessions)
- **Email**: Nodemailer
- **Deployment**: Docker + Docker Compose

## Getting Started (local development)

### 1. Prerequisites

- Node.js 22+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (for local Postgres — or point `DATABASE_URL` at your own Postgres instance)

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in real values — see the comments in `.env.example` for what each variable does. At minimum
for local development you need `DATABASE_URL` and `NEXTAUTH_SECRET`. SMTP variables can stay as
placeholders; the contact/career forms will still save to the database, they just won't send
email until real SMTP credentials are added.

> The default `POSTGRES_PORT` is **5433**, not 5432 — this avoids clashing with a Postgres
> instance that may already be running locally. Change it if 5433 is also taken.

### 4. Start Postgres

```bash
docker compose up -d db
```

### 5. Run migrations and seed real company data

```bash
pnpm prisma:migrate
pnpm prisma:seed
```

The seed script populates the database with **Bensal Investment Co. Ltd.'s real profile data**
(from `info/BENPROFILE.pdf`) and creates one admin user from `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in your `.env`.

### 6. Run the dev server

```bash
pnpm dev
```

Visit http://localhost:3000. Sign in to the admin placeholder dashboard at
http://localhost:3000/login with the seeded admin credentials.

## Running with Docker

```bash
docker compose up -d db
docker compose run --rm migrate   # apply migrations (first run + after schema changes)
docker compose up -d --build web
```

The app will be available on `http://localhost:${APP_PORT:-3000}`. Uploaded files persist in the
`bensal_uploads` Docker volume, mounted at `/app/public/uploads`.

## Content & Branding

All company content (name, history, mission/vision, services, leadership, branches, stats,
contact details) is stored in the database and sourced from `info/BENPROFILE.pdf` — see
`prisma/seed.ts` for exactly what was extracted and where a description had to be summarized
because the source PDF didn't include distinct body copy for it (clearly commented in the file).

Brand assets (logo, inverse logo, icon, favicon, brand colors) are copied from
`info/Bensal Investment/` into `public/brand/`. The Tailwind color theme in `app/globals.css` was
sampled directly from the logo files.

## Project Structure

```
app/
  (site)/        Public marketing pages (home, about, services, products, ...)
  (admin)/       Auth-gated admin routes (login, dashboard placeholder)
  api/           Route handlers (NextAuth)
components/
  ui/            Hand-built shadcn-style primitives (Radix + CVA + Tailwind)
  layout/        Navbar, footer, page chrome
  home/          Homepage sections
  forms/         Contact / quotation / career / newsletter forms
  motion/        Shared Framer Motion primitives (fade-in, counters)
actions/         Server actions (form submissions)
lib/             Prisma client, auth config, mailer, validation, queries
prisma/          schema.prisma, migrations, seed.ts
docker/          Dockerfile (multi-stage: deps → build → migrator / runner)
```

## Roadmap

- **Phase 2**: Full admin CRUD dashboard (Services, Products, Projects, Gallery, News,
  Testimonials, Partners, Clients, FAQs, Careers, Messages, Quotations, Newsletter, Media
  Library, Menus, SEO settings) with TipTap editor, drag-drop uploads, search/sort/filter,
  soft delete + restore, CSV/Excel/PDF export.
- **Phase 3**: Role-based access control, audit logging, notifications, 2FA scaffolding,
  system settings.
- **Phase 4**: SEO polish (sitemap/robots/JSON-LD), performance pass, PWA manifest, i18n
  scaffolding, full documentation set.

## Security Notes

- Never commit `.env`. Rotate `NEXTAUTH_SECRET` and the seeded admin password before going to
  production.
- File uploads are validated by MIME type and size (3MB max — kept under Vercel's hard 4.5MB serverless request body limit, see next.config.ts) before being written to disk.
- Server actions are rate-limited per IP (in-memory — swap for Redis if you scale beyond a
  single instance).
- `middleware.ts` sets baseline security headers (CSP, X-Frame-Options, etc.) and protects
  `/admin/*` routes.

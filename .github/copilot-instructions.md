# Copilot instructions for Datima codebase

Purpose
- Help AI coding assistants make focused, safe, and correct code changes in this repository.

Big picture (what to know first)
- Framework: Next.js (app router) — top-level app routes live in `src/app/` and use React Server Components by default.
- Data layer: Prisma + Postgres. Prisma client is initialized with a pooled Postgres adapter in `src/lib/prisma.ts` and models are defined in `prisma/schema.prisma`.
- Auth: `src/lib/lucia.ts` implements session creation/validation using hashed tokens stored in the `Session` model in Prisma.
- Email: `src/lib/resend.ts` wraps the `resend` SDK; templates live under `src/emails` and the `email` npm script runs the dev email preview.
- Storage: AWS S3 client is in `src/lib/aws.ts` and expects `AWS_*` env vars.

Developer workflows (commands to run)
- Install & generate Prisma client: `npm install` (postinstall runs `prisma generate`).
- Dev server: `npm run dev` (uses `next dev --turbopack`).
- Build & start: `npm run build` then `npm run start`.
- Typecheck: `npm run type`.
- Lint: `npm run lint` (and `npm run lint-fix`).
- Seed DB: `npm run seed` (runs `prisma/seed.ts` and stripe seed helper). For interactive migrations use `npx prisma migrate dev`.

Project-specific conventions
- Server vs client: Files under `src/app` are server components by default. Add `"use client"` at the top of a file for client components.
- Single-source libs: Put integrations and singletons in `src/lib/*` (e.g., `prisma.ts`, `aws.ts`, `resend.ts`, `lucia.ts`) and import those rather than reinitializing SDKs.
- Session handling: Sessions are hashed using `utils/crypto` and stored in Prisma `Session`; when updating or removing sessions prefer the helper functions in `src/lib/lucia.ts`.
- DB access: Use the exported `prisma` from `src/lib/prisma.ts` to ensure pooling and reuse across serverless/runtime environments.
- Emails: Use the `resend` instance from `src/lib/resend.ts` and React-Email templates under `src/emails`.

Integration & env notes
- Required environment variables: `DATABASE_URL`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_REGION`, `RESEND_API_KEY`, plus auth and stripe keys used in runtime.
- Postinstall hook runs `prisma generate` — ensure that `node_modules` install completes before running other scripts.

Files to inspect for examples
- Prisma + pool: [src/lib/prisma.ts](src/lib/prisma.ts)
- Session helpers: [src/lib/lucia.ts](src/lib/lucia.ts)
- S3 client: [src/lib/aws.ts](src/lib/aws.ts)
- Email client: [src/lib/resend.ts](src/lib/resend.ts)
- DB schema: [prisma/schema.prisma](prisma/schema.prisma)
- Package scripts: [package.json](package.json)

Quick editing rules for AI agents
- Prefer minimal, local edits. When changing runtime behavior (auth, DB, S3), update the `src/lib/*` client singletons first.
- Preserve existing patterns: if code uses `prisma` from `src/lib/prisma.ts`, update calls rather than introducing a new `PrismaClient` instance.
- When adding new env keys, also update any README or deployment config the user points out in a follow-up.
- For frontend work, keep CSS in `src/app/globals.css` and follow Tailwind utility classes used across components.

When uncertain, ask the human
- If a change touches authentication, database migrations, or external secrets, ask for confirmation and the target environment (dev/staging/prod) before applying.

If you made changes, run these to verify locally
- `npm run type` — type check
- `npm run lint` — lint
- `npm run dev` — manual verification in browser

Feedback
- If any section is unclear or missing specifics you'd like Copilot to follow, request an update and point to example files or workflows.

# AGENTS.md

## Project

KnowHub — TypeScript monorepo. Package manager: **npm** (workspaces from root).

## Workspaces

- `apps/api` — NestJS API
- `apps/web` — Next.js 15
- `apps/cli` — Commander.js CLI
- `packages/shared-types` — cross-surface type contracts
- `packages/shared-utils` — shared utilities

## Commands

- Lint: `npm run lint`
- Test: `npm run test`
- Build core (no web): `npm run build` · Full: `npm run build:all`
- Dev core: `npm run dev` · Web only: `npm run dev:web`
- Database (API workspace): `npm run db:migrate` · `npm run db:seed` · `npm run db:reset`

## Rules

- Scope changes to the affected workspace.
- Run `npm run lint` before proposing final changes.
- Prefer `npm run build -w @knowhub/api` when validating API-only changes.

## Current Delivery State

- Current release tag: `v0.4.2` (`release-v0.4.2`)
- EPIC-1.2 delivered: Knowledge Entry CRUD (`NOTE`, `LINK`, `PDF`, `GITHUB`) with tags and FTS.
- Prioritize consistency between:
  - API validation rules
  - shared contracts in `packages/shared-types`
  - SQL migrations under `apps/api/src/db/migrations`

## Progressive Disclosure

Read only when the task requires it:

- Build/dev issues, CI/CD, or Windows + OneDrive errors → [docs/agent/workflows.md](docs/agent/workflows.md)
- TypeScript conventions, ESLint/Prettier config, or commit format → [docs/agent/code-style.md](docs/agent/code-style.md)
- Changes spanning multiple workspaces or touching shared packages → [docs/agent/architecture.md](docs/agent/architecture.md)

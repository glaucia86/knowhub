# AGENTS.md

## Project

KnowHub is a TypeScript monorepo with API, Web, CLI, and shared packages.

## Package Manager

Use `npm` (workspaces enabled from the repository root).

## Fast Start (Non-Standard Commands)

- Core build only (excludes web): `npm run build`
- Full build (core + web): `npm run build:all`
- Core dev only (excludes web): `npm run dev`
- Web dev isolated: `npm run dev:web`

## Repository Map

- `apps/api`: NestJS API
- `apps/web`: Next.js app
- `apps/cli`: CLI
- `packages/shared-types`: shared type contracts
- `packages/shared-utils`: shared helper utilities

## Rules

- Keep `AGENTS.md` in repository root.
- Prefer changes scoped to the affected workspace.
- Run `npm run lint` before proposing final changes.

## Progressive Disclosure

For detailed guidance, read these files only when needed:

- `docs/agent/workflows.md` (build/dev flows, Windows + OneDrive behavior)
- `docs/agent/code-style.md` (TypeScript, lint, formatting, commit gates)
- `docs/agent/architecture.md` (workspace boundaries and integration points)

## Last Updated

2026-02-23

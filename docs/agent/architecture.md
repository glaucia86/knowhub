# Architecture

## Workspaces

- `apps/api`: HTTP endpoints and orchestration logic.
- `apps/web`: UI and web surface.
- `apps/cli`: local command workflows.
- `packages/shared-types`: cross-surface contracts.
- `packages/shared-utils`: reusable helpers.

## Integration Rules

1. Shared contracts belong in `packages/shared-types`.
2. Reusable logic belongs in `packages/shared-utils`.
3. App-specific behavior stays inside each `apps/*` workspace.
4. Validate cross-surface impact after shared contract changes.

## Current Stability Notes

- Core workspaces build reliably with `npm run build`.
- Web workspace may require isolated execution in constrained Windows environments.

## Current Product State

- Release baseline: `v0.4.2`.
- Delivered:
  - EPIC-1.1: auth, setup, health, settings.
  - EPIC-1.2: Knowledge Entry CRUD (types `NOTE`, `LINK`, `PDF`, `GITHUB`), tags, FTS, reindex flow.
- When touching knowledge flows, keep these layers aligned:
  1. DTO/service validation in `apps/api`.
  2. Database schema and SQL migrations in `apps/api/src/db`.
  3. shared contracts/utilities in `packages/shared-types` and `packages/shared-utils`.

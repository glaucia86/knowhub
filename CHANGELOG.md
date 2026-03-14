# Changelog

All notable changes to this repository are documented in this file.

## [v0.4.2] - 2026-03-08

### Added

- EPIC-1.2: Full Knowledge Entry CRUD module in the NestJS API.
  - Endpoints: `POST /api/v1/knowledge`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id` (archive), `POST /:id/reindex`.
  - Supported entry types: `NOTE`, `LINK`, `PDF`, `GITHUB`.
  - Status lifecycle: `PENDING` → `INDEXING` → `INDEXED` · soft-archive via `DELETE` → `ARCHIVED` · reindexing via `/reindex`.
  - Tags with automatic normalization and deduplication.
  - Full-text search (FTS) via SQLite `fts5` with `q` filter support on paginated listing.
  - `safe-file-path.validator.ts` for secure file path validation.
  - `pagination-helper.service.ts` and `title-generator.service.ts` as shared services.
  - `indexing-outbox.service.ts` for async indexing task queuing.
  - Database migrations: `0003_knowledge_entry_crud.sql`, `0004_knowledge_entry_epic_1_2_alignment.sql`, `0005_knowledge_fts_index.sql`.
  - Test suite: 8 integration specs + 2 unit specs for the knowledge and tags modules.
- `packages/shared-types`: new types `knowledge.types.ts` (`KnowledgeEntryType`, `KnowledgeEntryStatus`, `KnowledgeEntryResponse`, etc.) and `events.types.ts`.
- `packages/shared-utils`: new `knowledge-query.ts` utility with `buildKnowledgeListQuery` helper.
- Web: full landing page redesign (Raycast/Linear style, dark theme, responsive).
  - New components: `NavBar` (sticky, frosted glass, mobile drawer), `Footer` (links, tech badges).
  - Sections: Hero (mouse-tracking spotlight, animated orbs, typewriter terminal), Stats (animated counters), Value, WhyLocal (stagger scroll), Workflow, Audience, TechBadges, FinalCta.
  - Animation library: `framer-motion` + CSS keyframes (`orbDrift`, `gradientShimmer`).
  - Color token: `--kh-accent` updated to `#c8913a` (amber-gold) for semantic alignment with "knowledge / wisdom".
  - Landing page screenshot: `resources/home-page-v1.png`.
- `apps/web/src/lib/motion-presets.ts`: reusable Framer Motion animation presets.
- `docs/testing/epic-1.2-validation.md`: manual validation guide for EPIC-1.2.

### Changed

- `apps/api/src/db/schema.ts`: `knowledge_entries` table with full fields, FK to `users`, indexes, and FTS support.
- `apps/api/src/main.ts`: Swagger enabled with `Knowledge` tag and Bearer security configuration.
- `apps/web/app/layout.tsx`: Inter font via `next/font/google` and full metadata export.
- `apps/web/app/globals.css`: design system extended with new utility classes and keyframes.

### Fixed

- Knowledge API: `GITHUB` source validation hardened to allow only `github.com` and `*.github.com` hosts.
- Knowledge API/DB: alignment between PDF payload validation and migrated schema via `0006_allow_pdf_filepath_only.sql`.
- FTS maintenance: update trigger now executes only when `title`, `content`, or `user_id` changes.
- Tags sync: removed per-tag full-list re-fetch loop in `TagsService` (`N+1` reduction).
- Knowledge repository: tag sorting in `loadTagsByEntryIds` now runs once per entry after accumulation.
- Shared contracts/utilities:
  - `EntryCreatedEvent.type` now reuses `KnowledgeEntryType`.
  - SQLite `normalize_search` UDF now reuses shared `normalizeSearchText`.
  - `TitleGeneratorService` now reuses shared `createNoteTitle`.
- Docs: removed machine-specific local path from `docs/testing/epic-1.2-validation.md`.

## [v0.4.1] - 2026-03-04

### Fixed

- Auth: refresh token rotation without redundant lookup, using persisted `refreshId` to chain `replacedByTokenId`.
- Auth: lazy DB initialization in `AuthService` to prevent constructor failures during tests/CI.
- Credential Store: lazy loading of `keytar` to avoid rejected promise on startup when the optional dependency is absent.
- Health: `/api/v1/health` endpoint with consistent response matching the custom contract (`ok`/`degraded` with `200`, `error` with `503`) without Terminus interception.
- API DB client: automatic creation of the SQLite parent directory before opening the file (`better-sqlite3`), fixing CI failures.
- CLI setup: error handling with `spinner.fail(...)` in the secrets storage block.
- CLI setup: `ecosystem.config.js` passes `DATABASE_URL` explicitly to align the API with the database provisioned during setup.
- CLI setup: final messages with explicit `Web URL` and `API URL`, including a security note about `clientId` vs `clientSecret`.
- Auth rate-limit config: removed dead export `TOKEN_RATE_LIMIT_KEY`.

### Changed

- CI: Node.js pinned to `20` (LTS) in `lint`, `build`, and `test` jobs for greater pipeline stability.
- API env/docs: `DATABASE_URL` default aligned to the user's local database (`file:~/.knowhub/data/knowhub.db`).

## [v0.4.0] - 2026-03-04

### Added

- EPIC-1.1: local-first `setup` with identity generation, secure secret persistence, and configuration bootstrap.
- `Auth`, `Health`, and `Settings` modules in the API with routes `/api/v1/auth/*`, `/api/v1/health`, and `/api/v1/settings*`.
- Shared auth/health/settings contracts in `packages/shared-types`.
- Migration for `refresh_tokens` (stateful rotation/revocation) and `embedding_model` field.

### Changed

- Auth security hardening: timing-safe credential comparison, stabilized latency on failures, and local rate limiting.
- Healthcheck aligned to the PRD contract with aggregated status, `version`, `uptime`, and explicit degradation for optional dependencies.
- Settings with embedding compatibility warning support and model listing with TTL cache.
- Setup CLI with programmatic migration application, visual feedback (`ora`), and `ecosystem.config.js` generation for PM2.

### Fixed

- Fixed refresh token flow and revocation in the authentication lifecycle.
- Fixed idempotent bootstrap of user/settings during setup.

## [v0.3.0] - 2026-03-02

### Added

- Epic 0.3 local environment with `/dev/*` endpoints for status, schema, seed, and controlled reset.
- Dedicated local database scripts: `db:migrate`, `db:seed`, and `db:reset`.
- Environment configuration examples for local bootstrap.

### Changed

- Refactored SQLite migration/boot flow with schema version control and pending migration calculation.
- Environment variable validation with `defaultValue` support and runtime payload validation.
- Development endpoint gating by environment to reduce risk outside of `development`.

### Fixed

- Local bootstrap flow on Windows/OneDrive with more robust Node script execution.
- Database seeds for deterministic behavior.

### Dependencies

- Production and development dependency updates via Dependabot.
- GitHub Actions updates (`checkout`, `setup-node`, `upload-artifact`, `stale`, `first-interaction`).

### PR

- `#11` Merge pull request #11 from `glaucia86/001-local-dev-environment`
- `#10` Merge pull request #10 from `glaucia86/dependabot/npm_and_yarn/development-dependencies-9268cbf2e3`
- `#9` Merge pull request #9 from `glaucia86/dependabot/npm_and_yarn/production-dependencies-a7374d9f9d`
- `#8` Merge pull request #8 from `glaucia86/dependabot/github_actions/actions/upload-artifact-6`
- `#7` Merge pull request #7 from `glaucia86/dependabot/github_actions/actions/stale-10`
- `#6` Merge pull request #6 from `glaucia86/dependabot/github_actions/actions/checkout-6`
- `#5` Merge pull request #5 from `glaucia86/dependabot/github_actions/actions/first-interaction-3`
- `#4` Merge pull request #4 from `glaucia86/dependabot/github_actions/actions/setup-node-6`

### Commits

- `df2be8c` feat: add example environment configuration files for local development
- `d371ab0` refactor: database migration handling and environment validation
- `a970192` feat: add database migration, reset, and seed scripts
- `ef5c436` chore(deps-dev): bump the development-dependencies group with 7 updates
- `19e764c` chore(deps): bump the production-dependencies group with 7 updates

## [v0.2.1] - 2026-02-24

### Changed

- Updated `codecov-action` to `v5` in the CI pipeline.
- Improved `merge-gate` to display detailed status for `lint`, `build`, and `test`.
- Conditioned Codecov upload on the existence of `CODECOV_TOKEN`.

### Commits

- `3054b97` fix: update Codecov action to v5 and enhance merge gate checks with detailed status messages

## [v0.2.0] - 2026-02-24

### Added

- CI/CD automation with validation and release workflows.
- Issue/PR templates and contribution governance (`CODEOWNERS`).

### Changed

- CI configuration adjustments and PR template updates.
- Added `shared-types` as a dependency of `shared-utils`.

### PR

- `#3` Merge pull request #3 from `glaucia86/001-cicd-automations`

### Commits

- `f596262` feat: add CI/CD workflows, issue templates, and CODEOWNERS for repository automation
- `94bf656` fix: correct typo in pull request template and update CI configuration for error handling; feat: add shared-types dependency to shared-utils package

## [v0.1.1] - 2026-02-22

### Changed

- Fixed review comments and cross-platform compatibility adjustments for web configuration.

### PR

- `#2` Merge pull request #2 from `glaucia86/fix/post-merge-epic-0-1-v2`

### Commits

- `e2f58ce` fix: address review comments and cross-platform web config

## [v0.1.0] - 2026-02-22

### Added

- Monorepo initialization with shared `apps` and `packages`.

### Changed

- Refactored readiness evaluation logic and `tsconfig` adjustments.

### PR

- `#1` Merge pull request #1 from `glaucia86/001-spec-epic-0-1`

### Commits

- `0a2cb57` feat: initialize monorepo with shared types and utilities
- `dcc2903` refactor: update readiness evaluation logic and adjust tsconfig include paths

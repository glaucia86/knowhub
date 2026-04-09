# Code Style

## TypeScript

- Keep strict typing where possible.
- Avoid `any` unless justified.
- Prefer small, explicit interfaces for shared contracts.

## Lint and Format

- Lint command: `npm run lint`
- Formatter: Prettier (`.prettierrc`)
- ESLint config: `eslint.config.js`

## Pre-commit Gate

- Hook: `.husky/pre-commit`
- Command: `npx lint-staged`
- Scope: staged files only

## Commit Hygiene

- Exclude caches/artifacts (`.turbo/`, `.npm-cache/`, `.next/`, `dist/`, `coverage/`).
- Keep workspace-specific changes grouped when possible.

## Documentation Hygiene

- Keep `CHANGELOG.md` aligned with published tags and real release dates.
- Prefer repository-relative paths in docs; avoid machine-specific absolute paths.
- When updating README status/roadmap, ensure it matches the latest delivered epics and tags.

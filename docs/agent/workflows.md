# Workflows

## Default Commands

- Install deps: `npm install`
- Lint all workspaces: `npm run lint`
- Core build: `npm run build`
- Full build: `npm run build:all`
- Core dev: `npm run dev`
- Web dev: `npm run dev:web`

## Why core/web split exists

`apps/web` can fail with `spawn EPERM` in some Windows + OneDrive environments.

When this happens:

1. Use `npm run dev` for API/CLI/shared.
2. Use `npm run dev:web` in a separate terminal.
3. Treat `npm run build:web` as environment-conditional validation.

## CLI Checks

- Build CLI: `npm run build -w @knowhub/cli`
- Run CLI check: `node apps/cli/dist/index.js setup-check`

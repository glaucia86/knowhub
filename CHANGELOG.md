# Changelog

Todas as mudancas relevantes deste repositorio sao registradas neste arquivo.

## [v0.2.1] - 2026-02-24

### Changed

- Atualizacao do `codecov-action` para `v5` no pipeline de CI.
- Melhoria no `merge-gate` para exibir status detalhado de `lint`, `build` e `test`.
- Condicionamento do upload para Codecov a existencia de `CODECOV_TOKEN`.

### Commits

- `3054b97` fix: update Codecov action to v5 and enhance merge gate checks with detailed status messages

## [v0.2.0] - 2026-02-24

### Added

- Automacao de CI/CD com workflows de validacao e release.
- Templates de issue/PR e governanca de contribuicao (`CODEOWNERS`).

### Changed

- Ajustes na configuracao de CI e templates de PR.
- Inclusao de dependencia de `shared-types` no `shared-utils`.

### PR

- `#3` Merge pull request #3 from `glaucia86/001-cicd-automations`

### Commits

- `f596262` feat: add CI/CD workflows, issue templates, and CODEOWNERS for repository automation
- `94bf656` fix: correct typo in pull request template and update CI configuration for error handling; feat: add shared-types dependency to shared-utils package

## [v0.1.1] - 2026-02-22

### Changed

- Correcao de comentarios de review e ajustes de compatibilidade cross-platform para configuracao web.

### PR

- `#2` Merge pull request #2 from `glaucia86/fix/post-merge-epic-0-1-v2`

### Commits

- `e2f58ce` fix: address review comments and cross-platform web config

## [v0.1.0] - 2026-02-22

### Added

- Inicializacao do monorepo com `apps` e `packages` compartilhados.

### Changed

- Refactor na avaliacao de readiness e ajustes de `tsconfig`.

### PR

- `#1` Merge pull request #1 from `glaucia86/001-spec-epic-0-1`

### Commits

- `0a2cb57` feat: initialize monorepo with shared types and utilities
- `dcc2903` refactor: update readiness evaluation logic and adjust tsconfig include paths

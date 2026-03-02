# Changelog

Todas as mudancas relevantes deste repositorio sao registradas neste arquivo.

## [v0.3.0] - 2026-03-02

### Added

- Epic 0.3 de ambiente local com endpoints `/dev/*` para status, schema, seed e reset controlado.
- Scripts dedicados para banco local: `db:migrate`, `db:seed` e `db:reset`.
- Exemplos de configuracao de ambiente para bootstrap local.

### Changed

- Refactor no fluxo de migracao/boot do SQLite com controle de versao de schema e calculo de migrations pendentes.
- Validacao de variaveis de ambiente com suporte a `defaultValue` e validacao em runtime dos payloads.
- Gating de endpoints de desenvolvimento por ambiente para reduzir risco fora de `development`.

### Fixed

- Fluxo de bootstrap local em Windows/OneDrive com execucao mais robusta dos scripts Node.
- Seeds de banco para comportamento deterministico.

### Dependencies

- Atualizacoes de dependencias de producao e desenvolvimento via Dependabot.
- Atualizacoes de GitHub Actions (`checkout`, `setup-node`, `upload-artifact`, `stale`, `first-interaction`).

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

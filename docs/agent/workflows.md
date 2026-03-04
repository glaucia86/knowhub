# Workflows

## Default Commands

- Install deps: `npm install`
- Lint all workspaces: `npm run lint`
- Core build: `npm run build`
- Full build: `npm run build:all`
- Core dev: `npm run dev`
- Web dev: `npm run dev:web`

## CI/CD and Repository Automation

### Contribution validation (CI)

- Trigger: `pull_request` para `main`, `push` em `main` e execução manual.
- Concurrency: execuções concorrentes no mesmo `ref` são canceladas para evitar filas desnecessárias.
- Pipeline obrigatório:
  - `lint`
  - `build` (depende de lint)
  - `test` + upload de cobertura (depende de build)
  - `merge-gate` (falha se qualquer etapa obrigatória falhar)
- Objetivo operacional: bloquear merge quando qualquer gate obrigatório falhar.

### Release automation

- Trigger: criação de tag semântica (`vX.Y.Z` ou `vX.Y.Z-label.N`).
- Pré-condição técnica:
  - validação da tag por `scripts/ci/validate-release-tag.mjs`
  - execução de `lint`, `build` e `test`
- Publicação:
  - release GitHub automática com notas geradas do histórico.
  - placeholder mantido para futura publicação do pacote CLI.

### Community operations

- `stale.yml`:
  - marca issues inativas após 30 dias
  - marca PRs inativos após 21 dias
  - fecha após 7 dias sem nova atividade
  - labels de exceção: `security`, `critical`, `onboarding`, `pinned`
- `welcome.yml`:
  - mensagem automática para primeira issue/PR.

### Dependency updates

- `dependabot.yml` semanal para:
  - dependências `npm` agrupadas por tipo (`production` e `development`)
  - workflows de GitHub Actions

## Operational Prerequisites

Antes de considerar o fluxo pronto em produção do repositório:

1. Branch protection configurada em `main` com required checks:
   - `Lint`
   - `Build`
   - `Test and Coverage`
   - `Merge Gate`
2. CODEOWNERS ativo com revisão obrigatória.
3. Secret opcional `CODECOV_TOKEN` configurado quando necessário.
4. Permissões de Actions habilitadas para criação de release.
5. Contribuição via templates (`ISSUE_TEMPLATE` e `PULL_REQUEST_TEMPLATE`) habilitada no GitHub.

## Why core/web split exists

`apps/web` can fail with `spawn EPERM` in some Windows + OneDrive environments.

When this happens:

1. Use `npm run dev` for API/CLI/shared.
2. Use `npm run dev:web` in a separate terminal.
3. Treat `npm run build:web` as environment-conditional validation.

## CLI Checks

- Build CLI: `npm run build -w knowhub-ai`
- Run CLI check: `node apps/cli/dist/index.js setup-check`

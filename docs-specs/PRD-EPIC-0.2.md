# PRD — EPIC-0.2: CI/CD e Automações

**KnowHub AI Assistant** · Glaucia Lemos
Versão 1.0 · Fevereiro 2026 · Projeto Open Source · Licença MIT

---

## Índice

1. [Contexto e Motivação](#1-contexto-e-motivação)
2. [Objetivo do Épico](#2-objetivo-do-épico)
3. [Conexão com a Visão do Produto](#3-conexão-com-a-visão-do-produto)
4. [Escopo](#4-escopo)
5. [Arquitetura dos Pipelines](#5-arquitetura-dos-pipelines)
6. [Histórias de Usuário e Critérios de Aceite](#6-histórias-de-usuário-e-critérios-de-aceite)
7. [Especificações Técnicas Detalhadas](#7-especificações-técnicas-detalhadas)
8. [Definição de Pronto (Definition of Done)](#8-definição-de-pronto-definition-of-done)
9. [Tarefas Técnicas](#9-tarefas-técnicas)
10. [Dependências](#10-dependências)
11. [Estratégia de Testes](#11-estratégia-de-testes)
12. [Riscos e Mitigações](#12-riscos-e-mitigações)
13. [Métricas de Sucesso](#13-métricas-de-sucesso)
14. [Estimativa e Priorização](#14-estimativa-e-priorização)
15. [Referências](#15-referências)

---

## 1. Contexto e Motivação

### 1.1 Por que este épico existe

O KnowHub AI Assistant é desenvolvido como um projeto open source genuíno — o que significa que contribuidores externos enviarão Pull Requests sem supervisão direta. Sem um sistema de CI/CD robusto, cada PR representa um risco de regressão: código que quebra o build, testes que falham silenciosamente ou mudanças incompatíveis com outros workspaces do monorepo.

A qualidade percebida de um projeto open source é medida em grande parte pela maturidade da sua infraestrutura de automação. Projetos sem CI visível em cada PR afastam contribuidores experientes, que esperam esse padrão como linha de base.

**GitHub Actions** foi escolhido como plataforma de CI/CD pelos seguintes motivos:

- Nativo ao GitHub, sem fricção de integração
- Gratuito para projetos públicos (tier generoso para projetos privados)
- Ecossistema rico de Actions reutilizáveis no Marketplace
- Configuração como código versionada junto ao repositório

### 1.2 O problema que este épico resolve

| Problema sem o épico                                                    | Solução entregue pelo épico                                      |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| PRs mergeados sem validação automática podem quebrar o build            | Pipeline CI bloqueia merge se qualquer etapa falhar              |
| Releases manuais são inconsistentes e propensos a erros humanos         | Pipeline de release automatiza geração de changelog e publicação |
| Issues e PRs inativas acumulam sem gestão, criando ruído                | Automações de stale e bots gerenciam ciclo de vida da comunidade |
| Dependências desatualizadas introduzem vulnerabilidades silenciosamente | Dependabot cria PRs de atualização automaticamente               |
| Novos contribuidores não sabem como estruturar suas mudanças            | Templates guiam o formato correto de PRs e issues                |

### 1.3 Alinhamento com os princípios do produto

> **"Contribuições são bem-vindas: o projeto é aberto a PRs, issues e discussões desde o primeiro dia."**
> — Especificação Não-Técnica, Seção 2 (Princípios Guia)

Para que contribuições sejam genuinamente bem-vindas, o processo de contribuição precisa ser seguro e previsível. CI/CD automatizado é o mecanismo que torna isso possível — nenhum mantenedor precisa revisar manualmente se o lint passou ou se os testes quebram, pois o pipeline responde isso antes do code review.

---

## 2. Objetivo do Épico

> **Ter pipelines automatizados de validação e release que garantam qualidade de código em toda contribuição externa, com métricas visíveis e automações que escalam o gerenciamento da comunidade sem overhead manual para os mantenedores.**

Este épico entrega três sistemas independentes mas complementares:

1. **Pipeline de validação de PR** — garante que nenhum código quebrado entra no branch `main`
2. **Pipeline de release** — automatiza completamente o processo de publicação de versões
3. **Automações de comunidade** — gerenciam o ciclo de vida de issues, PRs e dependências

---

## 3. Conexão com a Visão do Produto

O KnowHub AI Assistant tem como missão:

> _"Democratizar o acesso a um gerenciador de conhecimento com IA, poderoso para desenvolvedores e acessível para qualquer pessoa."_

Para que isso se realize como projeto open source sustentável, a infraestrutura de contribuição precisa ser:

- **Confiável:** cada build é reproduzível e verificável publicamente
- **Transparente:** o estado do CI é visível para qualquer pessoa no badge do README
- **Justa:** todos os PRs — externos e internos — passam pelos mesmos critérios automatizados
- **Escalonável:** o processo de release não depende de um único mantenedor com acesso a credenciais manuais

O EPIC-0.2 é o sistema nervoso da qualidade do projeto. Sem ele, o crescimento da base de contribuidores se torna um risco, não um ativo.

---

## 4. Escopo

### 4.1 Dentro do Escopo — MVP deste Épico

- Workflow `ci.yml` com jobs: `lint`, `build`, `test`
- Workflow `release.yml` disparado por tags semver `v*.*.*`
- Geração automática de changelog via `release-please`
- Publicação automática de GitHub Releases
- Workflow `stale.yml` para gestão de issues e PRs inativas
- Configuração do `dependabot.yml` para atualizações automáticas
- Arquivo `CODEOWNERS` para review automático por área de código
- Templates de PR com checklist estruturado
- Templates de issues: bug report, feature request e good first issue
- Badge de CI no `README.md`
- Integração com Codecov para cobertura de testes

### 4.2 Fora do Escopo — Este Épico

| Item                                            | Onde será tratado |
| ----------------------------------------------- | ----------------- |
| Estrutura do monorepo e scripts de build/test   | EPIC-0.1          |
| Docker Compose e ambiente local                 | EPIC-0.3          |
| README, CONTRIBUTING.md e documentação completa | EPIC-0.4          |
| Deploy do app em produção (PM2, cloud)          | EPICs posteriores |
| Infraestrutura de banco de dados e migrations   | EPIC-0.3          |
| Publicação do pacote npm (CLI)                  | EPIC-1.7          |

---

## 5. Arquitetura dos Pipelines

### 5.1 Visão Geral dos Workflows

```
.github/
├── workflows/
│   ├── ci.yml             # Validação em cada PR e push em main
│   ├── release.yml        # Publicação de release em tags v*.*.*
│   ├── stale.yml          # Gestão de issues e PRs inativas
│   └── welcome.yml        # Boas-vindas a novos contribuidores
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml     # Template de bug report (formulário)
│   ├── feature_request.yml # Template de feature request
│   └── good_first_issue.yml # Template para issues de onboarding
├── PULL_REQUEST_TEMPLATE.md # Template de PR com checklist
├── CODEOWNERS             # Owners por área de código
└── dependabot.yml         # Configuração do Dependabot
```

### 5.2 Fluxo do Pipeline de CI

```
Pull Request aberto / push em branch
           │
           ▼
┌──────────────────────────────┐
│         Job: lint            │
│  - npm ci (com cache)        │
│  - turbo run lint            │
│  Timeout: 5 min              │
└──────────┬───────────────────┘
           │ sucesso
           ▼
┌──────────────────────────────┐
│         Job: build           │
│  - npm ci (com cache)        │
│  - turbo run build           │
│  Timeout: 10 min             │
└──────────┬───────────────────┘
           │ sucesso
           ▼
┌──────────────────────────────┐
│         Job: test            │
│  - npm ci (com cache)        │
│  - turbo run test            │
│  - Upload cobertura Codecov  │
│  - Comentário no PR          │
│  Timeout: 10 min             │
└──────────┬───────────────────┘
           │
     sucesso ──── Status check: ✅ All checks passed
     falha ────── Status check: ❌ CI / <job> (pull_request) FAILED
                  Branch protection bloqueia merge
```

### 5.3 Fluxo do Pipeline de Release

```
git tag v1.2.3 && git push --tags
           │
           ▼
┌──────────────────────────────┐
│      Trigger: tag v*.*.*     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   Job: validate              │
│  - Checkout tag              │
│  - npm ci                    │
│  - turbo run lint build test │
└──────────┬───────────────────┘
           │ sucesso
           ▼
┌──────────────────────────────┐
│   Job: changelog             │
│  - release-please            │
│  - Extrai commits desde      │
│    última tag                │
│  - Gera CHANGELOG.md         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   Job: github-release        │
│  - Cria GitHub Release       │
│  - Anexa CHANGELOG como body │
│  - Anexa assets (se houver)  │
└──────────────────────────────┘
           │
           ▼ (quando CLI estiver publicável — EPIC-1.7)
┌──────────────────────────────┐
│   Job: npm-publish           │
│  - npm publish (CLI package) │
│  - Requer secret NPM_TOKEN   │
└──────────────────────────────┘
```

### 5.4 Estratégia de Cache

O tempo de pipeline é crítico (meta: < 5 minutos). Cache em múltiplas camadas:

| Camada           | Chave de Cache                                   | O que armazena                         |
| ---------------- | ------------------------------------------------ | -------------------------------------- |
| npm dependencies | `hashFiles('**/package-lock.json')`              | `node_modules` de todos os workspaces  |
| Turborepo cache  | `hashFiles('turbo.json') + hashFiles('**/*.ts')` | Outputs de build e test anteriores     |
| Next.js build    | `hashFiles('apps/web/**')`                       | `.next/cache` para builds incrementais |

```yaml
# Exemplo: cache de dependências npm
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      apps/*/node_modules
      packages/*/node_modules
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

### 5.5 Versão de Node.js e Compatibilidade

```yaml
strategy:
  matrix:
    node-version: ['22.x'] # LTS principal
    os: [ubuntu-latest]
```

> **Decisão de escopo:** A matrix de Node.js é limitada à versão LTS atual para manter o pipeline rápido. Compatibilidade entre versões Node.js não é um requisito do MVP. A versão é alinhada com o que está declarado no `package.json` (`engines.node`).

---

## 6. Histórias de Usuário e Critérios de Aceite

---

### STORY-0.2.1 — Pipeline de Validação de PR

> **Como mantenedor do projeto, quero que cada Pull Request seja automaticamente validado para garantir que não quebra o build nem os testes, sem que eu precise executar nada manualmente.**

**Contexto:** O pipeline de CI é a primeira linha de defesa contra regressões. Ele precisa ser rápido o suficiente para não frustrar contribuidores (< 5 minutos), mas rigoroso o suficiente para capturar qualquer quebra. A ordem `lint → build → test` é intencional: falhar rápido em lint é mais barato do que descobrir um erro de compilação 3 minutos depois.

**Critérios de Aceite:**

- [ ] Arquivo `.github/workflows/ci.yml` criado e ativo no repositório
- [ ] Workflow dispara em `on: [pull_request]` para qualquer branch alvo e em `push` para o branch `main`
- [ ] Pipeline executa os jobs em ordem sequencial: `lint` → `build` → `test`
- [ ] Cada job tem timeout explícito configurado (lint: 5 min, build: 10 min, test: 10 min)
- [ ] Falha em qualquer job interrompe o pipeline e marca o status check do PR como falha
- [ ] Branch protection rule configurada no repositório exigindo o status check `CI / test` para merge
- [ ] Tempo total do pipeline em condições normais (com cache hit) < 5 minutos
- [ ] Relatório de cobertura de testes é enviado ao Codecov e publicado como comentário no PR pelo `codecov/codecov-action`
- [ ] Badge `[![CI](https://github.com/org/knowhub/actions/workflows/ci.yml/badge.svg)](...)` adicionado ao `README.md` refletindo o estado do branch `main`
- [ ] Logs de cada job são legíveis no GitHub Actions UI sem necessidade de ferramentas externas
- [ ] Workflow usa `actions/checkout@v4` e `actions/setup-node@v4` (versões fixadas com SHA completo para segurança)

**Definição de "Passa no CI":**

```
✅ lint  — nenhum warning ou error reportado pelo ESLint em nenhum workspace
✅ build — todos os workspaces compilam: api (NestJS), web (Next.js), cli, shared-types, shared-utils
✅ test  — todos os testes passam; cobertura enviada ao Codecov
```

**Exemplo de saída esperada no PR:**

```
✅ CI / lint (pull_request)          — 1m 12s
✅ CI / build (pull_request)         — 2m 34s
✅ CI / test (pull_request)          — 1m 48s
─────────────────────────────────────────────
   Total: ~5m 34s (com cache: ~3m 20s)
```

**Comportamento em Falha:**

- Job `lint` falha → jobs `build` e `test` são cancelados automaticamente (fail-fast)
- PR recebe label automático `ci-failed` (via workflow)
- Merge é bloqueado pela branch protection rule

---

### STORY-0.2.2 — Pipeline de Release

> **Como mantenedor, quero que uma tag semver no formato `v1.2.3` dispare automaticamente a criação de um GitHub Release com changelog gerado a partir dos commits convencionais, sem nenhuma ação manual.**

**Contexto:** Releases manuais introduzem erros: changelog incompleto, versão errada no npm, esquecimento de anexar assets. A automação garante que o processo seja idempotente e auditável — qualquer release pode ser recriado determinísticamente a partir do histórico de commits.

**Critérios de Aceite:**

- [ ] Arquivo `.github/workflows/release.yml` criado e ativo
- [ ] Workflow dispara em `on: push: tags: ['v*.*.*']` e **somente** neste evento
- [ ] Antes de criar o release, o pipeline executa o mesmo CI completo (lint + build + test) para garantir que a tag aponta para código válido
- [ ] Changelog é gerado automaticamente com `release-please` baseado em commits convencionais desde a última tag
- [ ] Commits seguem o padrão **Conventional Commits**:
  - `feat:` → entrada em "Features"
  - `fix:` → entrada em "Bug Fixes"
  - `docs:` → entrada em "Documentation"
  - `chore:` → entrada em "Miscellaneous"
  - `BREAKING CHANGE:` no footer → seção "Breaking Changes" em destaque
- [ ] GitHub Release é criado com:
  - Título: `v1.2.3`
  - Body: changelog gerado
  - Estado: publicado (não draft)
  - Tag: a mesma tag que disparou o workflow
- [ ] Pacote npm do CLI **não** é publicado neste épico (placeholder comentado no workflow para EPIC-1.7)
- [ ] Assets de instalação (quando existirem) são anexados automaticamente via `gh release upload`
- [ ] Workflow usa `GITHUB_TOKEN` do repositório (não requer PAT manual) para criar o release
- [ ] Permissões do workflow explicitamente declaradas: `contents: write` e `pull-requests: write` (princípio do menor privilégio)

**Exemplo de Changelog Gerado:**

```markdown
## v0.2.0 (2026-03-01)

### Features

- **api:** adiciona endpoint de healthcheck com indicador de Ollama (#45)
- **cli:** comando setup configura ambiente automaticamente (#52)

### Bug Fixes

- **shared-types:** corrige tipo KnowledgeEntryStatus para incluir ARCHIVING (#48)

### Documentation

- adiciona seção de instalação no README (#50)
```

**Namespacing de Versões:**

| Tipo de tag     | Ação disparada                                     |
| --------------- | -------------------------------------------------- |
| `v1.2.3`        | Release estável — publicado                        |
| `v1.2.3-beta.1` | Pre-release — publicado como pre-release no GitHub |
| `v1.2.3-rc.1`   | Release Candidate — publicado como pre-release     |

---

### STORY-0.2.3 — Automações de Issues e PRs

> **Como mantenedor, quero automações que gerenciem o ciclo de vida de issues e PRs para escalar o gerenciamento da comunidade sem que eu precise monitorar o repositório manualmente todos os dias.**

**Contexto:** Um repositório open source ativo pode receber dezenas de issues e PRs por semana. Sem automação, o backlog cresce de forma caótica, issues ficam abertas indefinidamente sem resposta e contribuidores novos se sentem ignorados. As automações deste épico são o mínimo necessário para manter o repositório saudável.

**Critérios de Aceite:**

#### Gestão de Itens Inativas (Stale)

- [ ] Arquivo `.github/workflows/stale.yml` criado usando `actions/stale@v9`
- [ ] Issues sem atividade por **30 dias** recebem automaticamente a label `stale` e um comentário explicando que serão fechadas em 7 dias se não houver atividade
- [ ] PRs sem atividade por **14 dias** recebem a label `stale` com aviso de fechamento em 7 dias
- [ ] Issues com label `stale` são fechadas automaticamente após 7 dias adicionais sem atividade
- [ ] Issues com labels `pinned`, `security`, `in-progress` **nunca** recebem stale
- [ ] Issues com label `good first issue` **nunca** recebem stale (para não desestimular novatos)
- [ ] Workflow de stale roda diariamente às **01:00 UTC** (cron: `'0 1 * * *'`)

**Exemplo de mensagem stale para issues:**

```txt
This issue has not been active in the last 30 days. If it is still relevant,
please add a comment to keep it open. Otherwise,
it will be automatically closed in 7 days.

If you can solve this problem, see our guide at CONTRIBUTING.md.
```

#### Automações do Dependabot

- [ ] Arquivo `.github/dependabot.yml` configurado para:
  - `package-ecosystem: npm` com `directory: "/"` (raiz do monorepo)
  - Frequência: **semanal** (toda segunda-feira às 09:00 UTC)
  - Grupos de atualização: `production-dependencies`, `development-dependencies` (separados)
  - Limite de PRs abertos simultaneamente: 10
  - Labels automáticos: `dependencies`, `automated`
- [ ] Workflow separado (ou regra no `ci.yml`) auto-aprova e auto-mergeia PRs do Dependabot **somente se**:
  - O PR é do Dependabot (`github.actor == 'dependabot[bot]'`)
  - A atualização é de `patch` ou `minor` (não `major`)
  - Todos os checks do CI passaram
- [ ] Atualizações `major` **não** são auto-mergeadas — requerem review manual do mantenedor
- [ ] Atualizações também monitoram as GitHub Actions (`package-ecosystem: github-actions`)

**Exemplo de `.github/dependabot.yml`:**

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '09:00'
      timezone: 'America/Sao_Paulo'
    groups:
      production-dependencies:
        dependency-type: 'production'
      development-dependencies:
        dependency-type: 'development'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
      - 'automated'

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'github-actions'
      - 'automated'
```

#### Boas-vindas a Novos Contribuidores

- [ ] Workflow `.github/workflows/welcome.yml` criado
- [ ] Dispara em `pull_request_target: types: [opened]`
- [ ] Verifica se é o primeiro PR do autor no repositório via context `github.event.pull_request.author_association == 'FIRST_TIME_CONTRIBUTOR'`
- [ ] Posta comentário de boas-vindas com:
  - Agradecimento pela contribuição
  - Link para o `CONTRIBUTING.md`
  - Aviso sobre o processo de review (tempo esperado de resposta)
  - Link para o canal de discussão (GitHub Discussions)

**Exemplo de comentário de boas-vindas:**

```txt
Hello @username, welcome to KnowHub! 🎉

Thank you for your first contribution! Our team will review this PR shortly.

While you wait, check out:
- [Contribution guide](CONTRIBUTING.md) to understand our process
- [Commit convention](CONTRIBUTING.md#commits) to ensure your PR follows the standard
- [GitHub Discussions](../../discussions) for questions and suggestions

We are excited to build KnowHub with you!
```

---

## 7. Especificações Técnicas Detalhadas

### 7.1 Configuração Completa do `ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22.x'
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: lint
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build all workspaces
        run: npm run build

  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: build
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info,./apps/*/coverage/lcov.info,./packages/*/coverage/lcov.info
          flags: unittests
          fail_ci_if_error: false

      - name: Add coverage comment to PR
        uses: davelosert/vitest-coverage-report-action@v2
        if: github.event_name == 'pull_request'
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Decisões de design do `ci.yml`:**

| Decisão                                      | Justificativa                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `concurrency` com `cancel-in-progress: true` | Cancela runs anteriores do mesmo PR ao receber novo push, economizando minutos de CI |
| `timeout-minutes` explícito em cada job      | Evita que um job travado consuma runners indefinidamente                             |
| `npm ci` (não `npm install`)                 | Instalação determinística que respeita exatamente o `package-lock.json`              |
| `needs: lint` antes de `build`               | Fail-fast: erros de lint são descobertos antes de um build demorado                  |
| `fail_ci_if_error: false` no Codecov         | Upload de cobertura não deve bloquear CI se Codecov estiver fora do ar               |

### 7.2 Configuração Completa do `release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: write
  pull-requests: write

jobs:
  validate:
    name: Validate release
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint, build and test
        run: |
          npm run lint
          npm run build
          npm run test

  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog with release-please
        id: changelog
        uses: google-github-actions/release-please-action@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-type: node
          package-name: knowhub-ai
          changelog-types: |
            [
              {"type":"feat","section":"Features"},
              {"type":"fix","section":"Bug Fixes"},
              {"type":"docs","section":"Documentation"},
              {"type":"perf","section":"Performance"},
              {"type":"refactor","section":"Refactoring"},
              {"type":"chore","section":"Miscellaneous","hidden":false}
            ]

      # Placeholder para EPIC-1.7: publicação do CLI no npm
      # - name: Publish CLI to npm
      #   if: steps.changelog.outputs.release_created
      #   run: |
      #     echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
      #     npm publish --workspace=apps/cli
      #   env:
      #     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 7.3 Configuração do `CODEOWNERS`

```md
# CODEOWNERS — Owners automáticos por área de código

# Formato: <padrão de arquivo> <@usuario ou @org/equipe>

# Mantenedor principal — todas as mudanças

-                   @glaucia86

# API Backend

apps/api/ @glaucia86

# Frontend Web

apps/web/ @glaucia86

# CLI

apps/cli/ @glaucia86

# Pacotes compartilhados (requer review cuidadoso — breaking changes)

packages/ @glaucia86

# Workflows de CI/CD (requer review de segurança)

.github/workflows/ @glaucia86

# Documentação

docs/ @glaucia86
\*.md @glaucia86
```

> **Nota:** Para projetos iniciados por um único mantenedor, `CODEOWNERS` aponta apenas para `@glaucia86`. À medida que a comunidade crescer, times específicos (`@knowhub/core-maintainers`) serão criados para distribuir a carga de reviews.

### 7.4 Templates de Issues e PRs

#### Template: Bug Report (`.github/ISSUE_TEMPLATE/bug_report.yml`)

```yaml
name: Bug Report
description: Report an issue on KnowHub
labels: ['bug', 'needs-triage']
body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please fill out the fields below to help us reproduce and fix the issue.

  - type: textarea
    id: description
    attributes:
      label: Problem Description
      description: A clear and concise description of what is happening.
    validations:
      required: true

  - type: textarea
    id: reproduction-steps
    attributes:
      label: Steps to Reproduce
      description: Specific steps that reproduce the issue.
      placeholder: |
        1. Execute 'knowhub setup'
        2. Open http://localhost:3000
        3. Click on '...'
        4. Observe the error
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: Expected Behavior
      description: What you expected to happen.
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: Actual Behavior
      description: What actually happened.
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Logs (if applicable)
      description: Paste relevant logs here.
      render: shell

  - type: dropdown
    id: os
    attributes:
      label: Operating System
      options:
        - Windows
        - macOS
        - Linux (Ubuntu/Debian)
        - Linux (outras)
    validations:
      required: true

  - type: input
    id: node-version
    attributes:
      label: Versão do Node.js
      placeholder: ex. v22.4.0
    validations:
      required: true

  - type: input
    id: knowhub-version
    attributes:
      label: Versão do KnowHub
      placeholder: ex. v0.2.0
    validations:
      required: true
```

#### Template: Feature Request (`.github/ISSUE_TEMPLATE/feature_request.yml`)

```yaml
name: Feature Request
description: Suggest a new feature or improvement
labels: ['enhancement', 'needs-triage']
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem does this feature solve?
      description: Describe the pain or limitation you are experiencing.
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe how you envision the solution.
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Considered Alternatives
      description: What other approaches did you consider?

  - type: dropdown
    id: area
    attributes:
      label: Project Area
      options:
        - API (NestJS)
        - Frontend Web (Next.js)
        - CLI
        - Indexing Agent (RAG)
        - Query Agent (RAG)
        - Documentation
        - Other
    validations:
      required: true
```

#### Template de Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`)

```markdown
## Description

Describe what this PR does and why it is necessary.

Closes #(issue number)

## Type of Change

- [ ] 🐛 Bug fix (change that fixes an issue without breaking compatibility)
- [ ] ✨ New feature (change that adds functionality without breaking compatibility)
- [ ] 💥 Breaking change (change that breaks compatibility with previous versions)
- [ ] 📖 Documentation (only changes to documentation)
- [ ] 🔧 Chore (refactoring, tests, dependencies, CI)

## How to Test

Describe the steps to test this change:

1. ...
2. ...
3. ...

## Checklist

- [ ] My code follows the project conventions (`CONTRIBUTING.md`)
- [ ] I ran `npm run lint` locally without errors
- [ ] I ran `npm run build` locally without errors
- [ ] I ran `npm run test` locally — all tests pass
- [ ] I added tests for the new feature/bugfix
- [ ] I updated the relevant documentation (if applicable)
- [ ] Commit follows the Conventional Commits convention (`feat:`, `fix:`, `docs:`, etc.)

## Screenshots (if applicable)

Add screenshots if the change affects the visual interface.
```

---

## 8. Definição de Pronto (Definition of Done)

Este épico é considerado **DONE** quando todos os itens abaixo estiverem verificados:

### Entregáveis Obrigatórios

- [ ] `.github/workflows/ci.yml` ativo e passando no branch `main`
- [ ] `.github/workflows/release.yml` testado em branch de teste com tag `v0.0.1-test`
- [ ] `.github/workflows/stale.yml` ativo com configurações verificadas
- [ ] `.github/workflows/welcome.yml` ativo
- [ ] `.github/dependabot.yml` configurado e gerando PRs automaticamente
- [ ] `CODEOWNERS` criado e testado (verificado que os owners recebem review request em PRs de teste)
- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml` publicado
- [ ] `.github/ISSUE_TEMPLATE/feature_request.yml` publicado
- [ ] `.github/ISSUE_TEMPLATE/good_first_issue.yml` publicado
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` publicado
- [ ] Badge de CI adicionado ao `README.md`
- [ ] `CODECOV_TOKEN` configurado nos secrets do repositório
- [ ] Branch protection rule configurada no GitHub exigindo o status check `CI / test`

### Validações Funcionais

- [ ] Abrir um PR de teste e verificar que o CI executa automaticamente
- [ ] Simular falha de lint e verificar que o PR merge é bloqueado
- [ ] Criar tag `v0.0.1-test` e verificar que o release workflow executa
- [ ] Verificar que o changelog gerado inclui commits convencionais do histórico
- [ ] Abrir uma issue de teste e verificar o template de bug report
- [ ] Abrir um PR de teste com conta diferente e verificar o comentário de boas-vindas

### Documentação

- [ ] Seção "CI/CD" adicionada ao `CONTRIBUTING.md` explicando como os pipelines funcionam
- [ ] Secrets necessários documentados em `docs/agent/workflows.md`
- [ ] Processo de release documentado (como criar uma tag, o que esperar do pipeline)

---

## 9. Tarefas Técnicas

### 9.1 Setup Inicial

| #   | Tarefa                                                    | Estimativa | Responsável |
| --- | --------------------------------------------------------- | ---------- | ----------- |
| T1  | Criar `.github/` com estrutura de diretórios completa     | 30 min     | Dev         |
| T2  | Configurar secrets no repositório GitHub: `CODECOV_TOKEN` | 15 min     | Dev         |
| T3  | Ativar branch protection rule no `main`                   | 15 min     | Dev         |

### 9.2 Workflows de CI

| #   | Tarefa                                                          | Estimativa | Responsável |
| --- | --------------------------------------------------------------- | ---------- | ----------- |
| T4  | Criar `.github/workflows/ci.yml` com jobs lint/build/test       | 2h         | Dev         |
| T5  | Testar `ci.yml` em branch de feature — verificar que CI dispara | 1h         | Dev         |
| T6  | Confirmar que falha de lint bloqueia merge (branch protection)  | 30 min     | Dev         |
| T7  | Integrar Codecov: `codecov.yml` + `upload action`               | 1h         | Dev         |
| T8  | Adicionar badge de CI ao `README.md`                            | 15 min     | Dev         |

### 9.3 Workflows de Release

| #   | Tarefa                                                     | Estimativa | Responsável |
| --- | ---------------------------------------------------------- | ---------- | ----------- |
| T9  | Criar `.github/workflows/release.yml` com `release-please` | 2h         | Dev         |
| T10 | Testar release em branch de teste com tag `v0.0.1-alpha`   | 1h         | Dev         |
| T11 | Verificar formato do changelog gerado                      | 30 min     | Dev         |
| T12 | Documentar convenção de commits no `CONTRIBUTING.md`       | 1h         | Dev         |

### 9.4 Automações de Comunidade

| #   | Tarefa                                                     | Estimativa | Responsável |
| --- | ---------------------------------------------------------- | ---------- | ----------- |
| T13 | Criar `.github/workflows/stale.yml`                        | 1h         | Dev         |
| T14 | Criar `.github/dependabot.yml`                             | 30 min     | Dev         |
| T15 | Criar workflow de auto-merge para Dependabot (patch/minor) | 1h         | Dev         |
| T16 | Criar `.github/workflows/welcome.yml`                      | 1h         | Dev         |
| T17 | Criar `CODEOWNERS`                                         | 30 min     | Dev         |

### 9.5 Templates

| #   | Tarefa                                              | Estimativa | Responsável |
| --- | --------------------------------------------------- | ---------- | ----------- |
| T18 | Criar `.github/ISSUE_TEMPLATE/bug_report.yml`       | 1h         | Dev         |
| T19 | Criar `.github/ISSUE_TEMPLATE/feature_request.yml`  | 30 min     | Dev         |
| T20 | Criar `.github/ISSUE_TEMPLATE/good_first_issue.yml` | 30 min     | Dev         |
| T21 | Criar `.github/PULL_REQUEST_TEMPLATE.md`            | 30 min     | Dev         |

---

## 10. Dependências

### 10.1 Dependências Internas

| Épico                       | O que é necessário                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **EPIC-0.1** _(bloqueante)_ | Scripts `lint`, `build`, `test` funcionando no monorepo. O CI executa `npm run lint`, `npm run build` e `npm run test` — esses comandos precisam existir e retornar exit code 0 antes que o CI seja ativado. |

**Ordem de implementação recomendada:**

```
EPIC-0.1: monorepo + scripts ── deve estar completo ──▶ EPIC-0.2: CI/CD ativado
```

> Se o EPIC-0.2 for criado antes do EPIC-0.1 estar estabilizado, o pipeline falhará constantemente, criando ruído nos status checks.

### 10.2 Dependências Externas

| Dependência    | Tipo                     | Configuração necessária                                           |
| -------------- | ------------------------ | ----------------------------------------------------------------- |
| GitHub Actions | Plataforma CI            | Incluso no repositório GitHub público (gratuito)                  |
| Codecov        | Cobertura de testes      | Secret `CODECOV_TOKEN` (conta gratuita para projetos open source) |
| release-please | Geração de changelog     | Apenas `GITHUB_TOKEN` nativo (sem secret adicional)               |
| Dependabot     | Atualizações automáticas | Ativado nas configurações do repositório GitHub                   |

### 10.3 Dependências de Runtime do CI

O CI executa os scripts do monorepo. Portanto, qualquer dependência que `npm run build` ou `npm run test` precisar deve estar declarada no `package.json` dos workspaces relevantes:

```
node_modules instalados via npm ci
  └── turbo (build pipeline)
  └── eslint + plugins (lint)
  └── jest / vitest (test runner)
  └── typescript (compilação)
```

---

## 11. Estratégia de Testes

### 11.1 Abordagem

O EPIC-0.2 é testado **na própria plataforma que cria** — os workflows GitHub Actions são validados executando-os em branches de teste antes de ativar em `main`. Este é o equivalente ao "dogfooding" de CI/CD.

### 11.2 Checklist de Testes dos Workflows

#### CI (`ci.yml`)

| Cenário               | Como testar                        | Resultado esperado                            |
| --------------------- | ---------------------------------- | --------------------------------------------- |
| PR com código limpo   | Abrir PR com código válido         | Todos os jobs passam (✅)                     |
| PR com erro de lint   | Adicionar `var x = 1` sem uso      | Job `lint` falha, `build` e `test` cancelados |
| PR com erro de build  | Introduzir erro de tipo TypeScript | Job `build` falha                             |
| PR com teste falhando | Adicionar `expect(1).toBe(2)`      | Job `test` falha                              |
| Cache hit             | Segundo push no mesmo PR           | Pipeline completo em < 3 min                  |
| Codecov upload        | PR com testes                      | Comentário de cobertura aparece no PR         |

#### Release (`release.yml`)

| Cenário            | Como testar                                       | Resultado esperado                       |
| ------------------ | ------------------------------------------------- | ---------------------------------------- |
| Release normal     | Push de tag `v0.0.1-test` em branch de teste      | Release criado no GitHub com changelog   |
| Falha de validação | Tag com código inválido no HEAD                   | Job `validate` falha, release não criado |
| Changelog correto  | Commits com `feat:`, `fix:`, `docs:` antes da tag | Seções corretas no changelog gerado      |
| Pre-release        | Tag `v0.1.0-beta.1`                               | Release marcado como "pre-release"       |

#### Stale (`stale.yml`)

| Cenário            | Como testar                          | Resultado esperado                 |
| ------------------ | ------------------------------------ | ---------------------------------- |
| Issue inativa      | Verificar configuração do workflow   | Label `stale` aparece após 30 dias |
| Issue com `pinned` | Verificar lista de labels de exceção | Nunca recebe `stale`               |
| `good first issue` | Verificar lista de labels de exceção | Nunca recebe `stale`               |

#### Welcome (`welcome.yml`)

| Cenário                   | Como testar                      | Resultado esperado                |
| ------------------------- | -------------------------------- | --------------------------------- |
| Primeiro PR de conta nova | Abrir PR com conta de teste nova | Comentário de boas-vindas postado |
| PR subsequente            | Segundo PR da mesma conta        | Sem comentário de boas-vindas     |

### 11.3 Testes de Segurança dos Workflows

Workflows GitHub Actions são vetores de ataque em potencial (Supply Chain Attacks via `script injection`, `pwn requests`). Antes de ativar em `main`:

- [ ] Todas as Actions externas usam **versão fixa por SHA** (`actions/checkout@11bd71901bbe5e1cf671c...`), não apenas por tag (`@v4`)
- [ ] Nenhum workflow usa `pull_request_target` sem proteção explícita (exceto `welcome.yml` que não executa código do PR)
- [ ] Inputs de evento nunca são interpolados diretamente em `run:` (`echo ${{ github.event.pull_request.title }}` é XSS)
- [ ] Permissões dos workflows declaradas explicitamente com escopo mínimo
- [ ] Secrets não são logados (verificar com `actions/log-sanitizer`)

---

## 12. Riscos e Mitigações

| Risco                                                                         | Probabilidade | Impacto | Mitigação                                                                                                |
| ----------------------------------------------------------------------------- | ------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| Pipeline lento (> 5 min) frustra contribuidores                               | Média         | Alto    | Cache agressivo de `node_modules` e Turborepo cache; monitorar tempo em cada PR                          |
| Script injection em workflow via título de PR                                 | Baixa         | Crítico | Nunca interpolar `${{ github.event.* }}` em `run:` steps; usar variáveis de ambiente intermediárias      |
| CODECOV_TOKEN expirado quebra upload silenciosamente                          | Baixa         | Médio   | `fail_ci_if_error: false` no Codecov action; alertar se upload não ocorre por > 7 dias                   |
| release-please gera changelog incompleto                                      | Média         | Médio   | Documentar convenção de commits no CONTRIBUTING.md; validar format em PRs via linting de commits         |
| Dependabot auto-merge quebra o projeto com atualização `minor`                | Baixa         | Alto    | Auto-merge apenas após todos os checks passarem; `major` nunca é auto-mergeado                           |
| Workflow `welcome.yml` com `pull_request_target` abre vetores de supply chain | Baixa         | Alto    | `welcome.yml` não faz checkout do código do PR; usa apenas contexto do event para postar comentário      |
| CODEOWNERS mal configurado bloqueia todos os PRs                              | Baixa         | Médio   | Testar CODEOWNERS em branch de teste antes de ativar proteção obrigatória                                |
| Tempo de runner esgotado no tier gratuito do GitHub                           | Baixa         | Médio   | Monitorar uso mensal; otimizar cache para reduzir consumo; migrar para runners self-hosted se necessário |

---

## 13. Métricas de Sucesso

### 13.1 Métricas Quantitativas

| Métrica                                    | Meta                                         | Como medir                             |
| ------------------------------------------ | -------------------------------------------- | -------------------------------------- |
| Cobertura do CI em PRs                     | 100% dos PRs validados                       | GitHub Insights → Pull Requests        |
| Tempo médio do pipeline                    | < 5 minutos (P50)                            | GitHub Actions → workflow runs         |
| Tempo P95 do pipeline                      | < 8 minutos                                  | GitHub Actions metrics                 |
| Taxa de sucesso do pipeline                | > 95% (excluindo falhas legítimas de código) | GitHub Actions history                 |
| PRs mergeados sem CI passado               | 0                                            | Branch protection rules enforcement    |
| Releases sem changelog                     | 0                                            | Verificar releases criados manualmente |
| Dependências com > 30 dias sem atualização | 0 (Dependabot ativo)                         | Dependabot alerts                      |

### 13.2 Métricas Qualitativas

- Novo contribuidor consegue entender o resultado do CI sem documentação adicional
- Processo de release é documentado e pode ser executado por qualquer mantenedor com acesso ao repo
- Issues de bugs têm informações suficientes para reprodução graças ao template obrigatório

### 13.3 SLOs dos Pipelines

| SLO                             | Objetivo                                              |
| ------------------------------- | ----------------------------------------------------- |
| Disponibilidade do CI           | >= 99% (tolerância para outages planejados do GitHub) |
| Tempo de resposta do CI ao push | < 2 minutos para iniciar o primeiro job               |
| Falsos positivos do CI          | < 1% (CI falha sem erro real no código)               |

---

## 14. Estimativa e Priorização

### 14.1 Estimativa Global

**Estimativa total: M (2–5 dias úteis)**

Detalhamento por componente:

| Componente                      | Estimativa    | Sequência           |
| ------------------------------- | ------------- | ------------------- |
| Workflow `ci.yml` + testes      | 1 dia         | Primeiro            |
| Workflow `release.yml` + testes | 1 dia         | Segundo             |
| Dependabot + automações         | 0,5 dia       | Terceiro            |
| Templates de issues e PR        | 0,5 dia       | Terceiro (paralelo) |
| Validação e documentação        | 0,5 dia       | Último              |
| **Total**                       | **~3,5 dias** |                     |

### 14.2 Ordem de Implementação Recomendada

```
Fase 1 (Crítico): ci.yml ──────── base para tudo mais
Fase 2 (Importante): release.yml  dependabot.yml
Fase 3 (Comunidade): stale.yml    welcome.yml    templates
Fase 4 (Polimento): CODEOWNERS    badges         documentação
```

> `ci.yml` é o único item verdadeiramente bloqueante. O resto pode ser iterado após o CI básico estar funcionando.

### 14.3 Priorização das Stories

| Story                    | Prioridade   | Justificativa                                 |
| ------------------------ | ------------ | --------------------------------------------- |
| STORY-0.2.1 (CI/PR)      | P0 — Crítico | Bloqueia qualquer contribuição externa segura |
| STORY-0.2.2 (Release)    | P1 — Alto    | Necessário antes da primeira release pública  |
| STORY-0.2.3 (Automações) | P2 — Médio   | Importante mas não bloqueia desenvolvimento   |

---

## 15. Referências

### Documentação Oficial

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [release-please GitHub Action](https://github.com/googleapis/release-please)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [actions/stale — Stale bot](https://github.com/actions/stale)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [CODEOWNERS Syntax](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

### Arquivos do Repositório

- [`AGENTS.md`](../AGENTS.md) — Regras e comandos do monorepo
- [`docs-specs/epicos.md`](./epicos.md) — Definição do EPIC-0.2
- [`docs/agent/workflows.md`](../docs/agent/workflows.md) — Fluxos de build e dev
- [`docs/agent/architecture.md`](../docs/agent/architecture.md) — Fronteiras dos workspaces
- [`PRD-EPIC-0.1.md`](./PRD-EPIC-0.1.md) — PRD do Setup do Monorepo (dependência)

### Segurança

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Keeping GitHub Actions Secure](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
- [OWASP — Software and Data Integrity Failures (A08)](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)

---

_PRD gerado em Fevereiro 2026 · KnowHub AI Assistant · Licença MIT_

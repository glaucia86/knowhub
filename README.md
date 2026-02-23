# KnowHub AI Assistant

<p align="center">
  <img src="resources/banner.svg" alt="KnowHub AI Assistant Banner" width="900"/>
</p>

<p align="center">
  <strong>Second brain local-first com IA para capturar, conectar e consultar conhecimento pessoal.</strong><br/>
  <sub>Open source • Privacidade por padrão • Monorepo TypeScript</sub>
</p>

<p align="center">
  <a href="https://github.com/glaucia86/knowhub-ai-assistant/stargazers">
    <img src="https://img.shields.io/github/stars/glaucia86/knowhub-ai-assistant?style=for-the-badge&logo=github" alt="Stars"/>
  </a>
  <a href="https://github.com/glaucia86/knowhub-ai-assistant/network/members">
    <img src="https://img.shields.io/github/forks/glaucia86/knowhub-ai-assistant?style=for-the-badge&logo=github" alt="Forks"/>
  </a>
  <a href="https://github.com/glaucia86/knowhub-ai-assistant/actions/workflows/ci.yml">
    <img src="https://github.com/glaucia86/knowhub-ai-assistant/actions/workflows/ci.yml/badge.svg?style=for-the-badge" alt="CI"/>
  </a>
  <a href="https://github.com/glaucia86/knowhub-ai-assistant/releases">
    <img src="https://img.shields.io/github/v/release/glaucia86/knowhub-ai-assistant?style=for-the-badge" alt="Latest Release"/>
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node"/>
  </a>
  <a href="https://www.npmjs.com/">
    <img src="https://img.shields.io/badge/npm-%3E%3D9-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm"/>
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#highlights">Highlights</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#roadmap-now">Roadmap Now</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

KnowHub reduz o caos de informação pessoal: notas, links, PDFs e insights espalhados em múltiplos lugares.

> [!IMPORTANT]
> **Local-first + privacidade por padrão**: nada vai para cloud sem consentimento explícito.

Princípios do projeto:

- Local-first por padrão
- Privacidade por padrão
- Open source orientado à comunidade
- IA útil no fluxo real de trabalho

Estado atual:

- Monorepo base implementado (EPIC-0.1)
- Apps: API, Web, CLI
- Pacotes compartilhados de tipos e utilitários

---

## Highlights

| Area                | Status | Description                                                        |
| ------------------- | ------ | ------------------------------------------------------------------ |
| Monorepo foundation | ✅     | Apps `api`, `web`, `cli` + `shared-types`/`shared-utils`           |
| Core quality gates  | ✅     | `lint`, `build` (core), `pre-commit` with `lint-staged`            |
| Web local run       | ⚠️     | Pode exigir execução isolada em Windows + OneDrive (`spawn EPERM`) |
| Specification docs  | ✅     | Produto, técnica e épicos documentados em `docs-specs/`            |

---

## Quick Start

### Prerequisites

- Node.js `>=20`
- npm `>=9`

### 1) Install and run core

```bash
npm install
npm run build         # core build (api/cli/shared)
npm run lint
```

### 2) Run dev

```bash
npm run dev           # core dev
npm run dev:web       # web dev (separado)
```

### 3) Optional full build

```bash
npm run build:all
```

### Windows + OneDrive note

`apps/web` pode falhar com `spawn EPERM` em alguns ambientes Windows/OneDrive.

Quando isso acontecer:

1. rode `npm run dev` para core
2. rode `npm run dev:web` separado
3. use `npm run build:web` como validação condicional local

---

## Commands

| Goal                | Command             |
| ------------------- | ------------------- |
| Build core          | `npm run build`     |
| Build web only      | `npm run build:web` |
| Build all           | `npm run build:all` |
| Dev core            | `npm run dev`       |
| Dev web             | `npm run dev:web`   |
| Dev all             | `npm run dev:all`   |
| Lint all workspaces | `npm run lint`      |

CLI quick check:

```bash
npm run build -w @knowhub/cli
node apps/cli/dist/index.js setup-check
```

---

## Project Structure

```text
knowhub/
├── apps/
│   ├── api/
│   ├── web/
│   └── cli/
├── packages/
│   ├── shared-types/
│   ├── shared-utils/
│   └── tsconfig/
├── docs-specs/
├── specs/
└── scripts/
```

---

## Roadmap Now

- EPIC-0.1: monorepo e tooling base
- EPIC-0.2+: CI/CD, ambiente local, governança open source
- Fase seguinte: evolução do MVP funcional (captura + query + conexões)

---

## Quality Gates

- Lint: `npm run lint`
- Pre-commit: `npx lint-staged` via `.husky/pre-commit`
- CI: `.github/workflows/ci.yml` (lint + core build)

---

## Documentation

- Product vision (non-technical): `docs-specs/spec-nao-tecnica.md`
- Technical specification: `docs-specs/spec-tecnica.md`
- Epics and stories: `docs-specs/epicos.md`

---

## Contributing

Contribuições são bem-vindas.

Fluxo recomendado:

1. crie branch a partir de `main`
2. mantenha PRs pequenas e focadas
3. rode `npm run lint` e `npm run build`
4. abra PR com contexto, impacto e validação

---

## License

MIT

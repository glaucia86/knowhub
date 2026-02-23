# KnowHub AI Assistant

<p align="center">
  <strong>Second brain local-first com IA para capturar, conectar e consultar conhecimento pessoal.</strong>
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
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

KnowHub AI Assistant foi desenhado para reduzir o caos de informação pessoal: notas, links, PDFs e insights espalhados em múltiplos lugares.

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

## Quick Start

### Prerequisites

- Node.js `>=20`
- npm `>=9`

### Install and run

```bash
npm install
npm run build         # core build (api/cli/shared)
npm run dev           # core dev
npm run dev:web       # web dev em terminal separado
npm run lint
```

### Windows + OneDrive note

`apps/web` pode falhar com `spawn EPERM` em alguns ambientes Windows/OneDrive.

Quando isso acontecer:

1. rode `npm run dev` para core
2. rode `npm run dev:web` separado
3. use `npm run build:web` como validação condicional local

---

## Commands

```bash
npm run build         # build core
npm run build:web     # build web only
npm run build:all     # build core + web

npm run dev           # dev core
npm run dev:web       # dev web
npm run dev:all       # tenta subir tudo

npm run lint          # lint all workspaces
```

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

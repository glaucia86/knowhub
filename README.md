# KnowHub AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node >=20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![npm >=9](https://img.shields.io/badge/npm-%3E%3D9-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/)
[![CI](https://github.com/glaucia86/knowhub-ai-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/glaucia86/knowhub-ai-assistant/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/glaucia86/knowhub-ai-assistant)](https://github.com/glaucia86/knowhub-ai-assistant/releases)

Second brain open source com IA local-first para capturar, organizar e consultar conhecimento pessoal com privacidade.

## Visão do Projeto

O KnowHub AI Assistant nasce para resolver um problema comum: conhecimento espalhado em notas, links, PDFs, issues e conversas.  
A proposta é centralizar esse conteúdo e permitir busca/conexões inteligentes sem depender de cloud por padrão.

Princípios do projeto:

- Local-first: roda localmente por padrão.
- Privacidade por padrão: nada vai para cloud sem consentimento explícito.
- Open source: código, roadmap e evolução guiados pela comunidade.
- Inteligência prática: foco em fluxo real de uso, não em demo.

## Status Atual

Este repositório está na fase de fundação do monorepo (EPIC-0.1), com:

- `apps/api` (NestJS)
- `apps/web` (Next.js)
- `apps/cli` (CLI)
- `packages/shared-types`
- `packages/shared-utils`

## Stack

- Node.js + TypeScript
- Turborepo + npm workspaces
- NestJS (API)
- Next.js (Web)
- ESLint + Prettier + Husky + lint-staged

## Estrutura do Repositório

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

## Pré-requisitos

- Node.js `>=20`
- npm `>=9`

## Quick Start

```bash
npm install
npm run build         # build core (api/cli/shared)
npm run dev           # dev core
npm run dev:web       # web em terminal separado
npm run lint
```

Comandos úteis:

```bash
npm run build:web     # build somente web
npm run build:all     # build core + web
npm run dev:all       # tenta subir tudo junto
```

## Nota para Windows + OneDrive

Em alguns ambientes Windows/OneDrive, `apps/web` pode falhar com `spawn EPERM` durante `next build`.

Fluxo recomendado nesses casos:

1. usar `npm run dev` para o core
2. usar `npm run dev:web` em terminal separado
3. tratar `npm run build:web` como validação condicional no ambiente local

## CLI

Build do CLI:

```bash
npm run build -w @knowhub/cli
```

Teste rápido:

```bash
node apps/cli/dist/index.js setup-check
```

## Qualidade de Código

- Lint global: `npm run lint`
- Hook de pre-commit: `npx lint-staged` via `.husky/pre-commit`
- Configuração ativa de lint: `eslint.config.js` (flat config)

## Documentação do Produto

- Visão não técnica: `docs-specs/spec-nao-tecnica.md`
- Especificação técnica: `docs-specs/spec-tecnica.md`
- Épicos e histórias: `docs-specs/epicos.md`

## Contribuição

Contribuições são bem-vindas.

Fluxo sugerido:

1. Crie uma branch a partir de `main`
2. Faça alterações pequenas e focadas
3. Rode `npm run lint` e `npm run build`
4. Abra PR com contexto claro do problema e da solução

## Licença

MIT

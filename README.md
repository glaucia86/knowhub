> 🇧🇷 Leia em [Português](README.pt-BR.md)

<div align="center">
  <img src="resources/banner.svg" alt="KnowHub AI Assistant Banner" width="900"/>
  <h1>KnowHub AI Assistant</h1>
  <p>Your local-first AI-powered second brain for developers</p>
</div>

<p align="center">
  <a href="https://github.com/glaucia86/knowhub/actions/workflows/ci.yml">
    <img src="https://github.com/glaucia86/knowhub/actions/workflows/ci.yml/badge.svg" alt="CI"/>
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/>
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js 22+"/>
  </a>
  <a href="CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
  </a>
</p>

---

## What is KnowHub?

KnowHub AI Assistant is a **local-first**, privacy-by-default knowledge manager
powered by AI. It helps developers capture, organize, and retrieve knowledge
from notes, links, PDFs, GitHub issues and more — with semantic search and
AI-generated summaries that never leave your device.

**Key principles:**

- 🔒 **Privacy first** — all AI processing runs locally via Ollama
- 🧠 **Second brain** — semantic connections between your knowledge pieces
- 💻 **Developer-focused** — CLI, REST API, and Web UI
- 🌍 **Open Source** — MIT licensed, community-driven

---

## Demo

> 🚧 **Screenshots and GIF coming soon** — the product is under active development.
> Follow the [roadmap](#roadmap) to track progress.

---

## Quick Start

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/glaucia86/knowhub.git
cd knowhub

# 2. Install all workspace dependencies
npm install

# 3. Set up environment variables
npm run env:setup

# 4. Start infrastructure services (Redis + Ollama)
docker compose up -d

# 5. Pull AI models (first time only — ~4 GB download)
make ollama-pull
# or: docker compose exec ollama ollama pull gemma3:4b

# 6. Start development servers
npm run dev
```

Access the app at:

- **Web UI:** http://localhost:3000
- **API:** http://localhost:3001
- **Ollama:** http://localhost:11434

> 💡 **Windows without WSL2:** replace `make ollama-pull` with
> `docker compose exec ollama ollama pull gemma3:4b`
>
> **Windows + OneDrive:** `apps/web` may fail with `spawn EPERM`. Run
> `npm run dev` for the core services and `npm run dev:web` separately.

### Database setup

```bash
npm run db:migrate
npm run db:seed
```

Full reset (removes `apps/api/local.db`, re-runs migrations and seed):

```bash
npm run db:reset
```

---

## Basic Usage

> 🚧 Usage examples will be added as features are implemented.
> See [EPIC-1.x issues](https://github.com/glaucia86/knowhub/labels/epic-1) for progress.

---

## Tech Stack

| Layer      | Technology                                                              | Purpose                |
| ---------- | ----------------------------------------------------------------------- | ---------------------- |
| API        | [NestJS](https://nestjs.com/)                                           | REST API server        |
| Web        | [Next.js 15](https://nextjs.org/)                                       | Frontend (App Router)  |
| CLI        | [Commander.js](https://github.com/tj/commander.js)                      | Terminal interface     |
| Database   | [SQLite](https://sqlite.org/) + [DrizzleORM](https://orm.drizzle.team/) | Local data storage     |
| Cache      | [Redis/Valkey](https://valkey.io/)                                      | Caching layer          |
| AI         | [Ollama](https://ollama.ai/)                                            | Local LLM runtime      |
| LLM        | [Gemma 3 4B](https://ollama.com/library/gemma3)                         | Language model         |
| Embeddings | [nomic-embed-text](https://ollama.com/library/nomic-embed-text)         | Vector embeddings      |
| Monorepo   | [Turborepo](https://turbo.build/) + npm workspaces                      | Build system           |
| Language   | [TypeScript 5](https://www.typescriptlang.org/)                         | Full-stack type safety |

---

## Roadmap

- **Phase 0 — Infrastructure** ✅ Monorepo, CI/CD, local dev environment, open source governance
- **Phase 1 — Core Features** 🚧 Knowledge ingestion, semantic search, AI Q&A via CLI
- **Phase 2 — Intelligence** 📋 Semantic connections, tagging, summarization
- **Phase 3 — Integrations** 📋 Telegram bot, GitHub issues, PDF ingestion
- **Phase 4 — Polish** 📋 Web UI, multi-user support, cloud sync (opt-in)

---

## Contributing

Contributions are welcome and appreciated! 🎉

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to set up the development environment
- Commit message conventions (Conventional Commits)
- How to submit a Pull Request
- Where to start as a first-time contributor ([Good First Issues](https://github.com/glaucia86/knowhub/labels/good%20first%20issue))

By contributing, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

Found a security vulnerability? Please read [SECURITY.md](SECURITY.md) before reporting.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

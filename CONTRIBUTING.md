# Contributing to KnowHub AI Assistant

Thank you for your interest in contributing to KnowHub! This guide explains
everything you need to know to make your first (or tenth) contribution.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Commit Convention](#commit-convention)
4. [Branch Convention](#branch-convention)
5. [Pull Request Flow](#pull-request-flow)
6. [Issue Labels](#issue-labels)
7. [Good First Issues](#good-first-issues)
8. [Code Style](#code-style)
9. [Testing](#testing)
10. [License and CLA](#license-and-cla)

---

## Development Setup

### Prerequisites

| Tool           | Version  | Install                                                |
| -------------- | -------- | ------------------------------------------------------ |
| Node.js        | 22.x LTS | [nodejs.org](https://nodejs.org/)                      |
| Docker Desktop | 24+      | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Git            | any      | [git-scm.com](https://git-scm.com/)                    |

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/knowhub.git
cd knowhub

# 2. Add the upstream remote
git remote add upstream https://github.com/glaucia86/knowhub.git

# 3. Install all workspace dependencies
npm install

# 4. Set up environment variables
npm run env:setup

# 5. Start infrastructure services (Redis + Ollama)
docker compose up -d

# 6. Start development servers
npm run dev

# 7. Verify everything works
curl http://localhost:3001/health
# Expected: {"status":"ok"}
```

> **Windows + OneDrive note:** `apps/web` may fail with `spawn EPERM` in some
> Windows/OneDrive environments. Run `npm run dev` for the core API/CLI, and
> `npm run dev:web` separately for the web app.

---

## Project Structure

```
knowhub/
├── apps/
│   ├── api/          # NestJS REST API (port 3001)
│   ├── web/          # Next.js frontend (port 3000)
│   └── cli/          # Commander.js CLI
├── packages/
│   ├── shared-types/ # Shared TypeScript type contracts
│   └── shared-utils/ # Shared helper utilities
├── docs-specs/       # Product and technical specifications
└── specs/            # Detailed spec documents per epic
```

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).
The CI pipeline enforces this convention via commitlint — non-conforming commits
will cause the build to fail.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation changes only                              |
| `chore`    | Maintenance tasks (deps, config, tooling)               |
| `test`     | Adding or updating tests                                |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `ci`       | Changes to CI/CD configuration                          |

### Scopes

Use the workspace name: `api`, `web`, `cli`, `shared-types`, `shared-utils`.
Omit scope for project-wide changes.

### Examples

```
feat(api): add knowledge entry creation endpoint
fix(web): resolve hydration error on knowledge list
docs: update README quick start section
chore(deps): update drizzle-orm to v0.38
test(api): add unit tests for IndexingAgent
refactor(shared-types): rename KnowledgeEntry to Entry
ci: add Node.js 22 matrix to CI workflow
feat(api)!: change authentication to JWT-only
```

> Breaking changes are indicated with a `!` after the type/scope and must
> include a `BREAKING CHANGE:` footer describing the impact.

---

## Branch Convention

| Pattern                          | Use case              |
| -------------------------------- | --------------------- |
| `feat/<issue-number>-short-desc` | New feature           |
| `fix/<issue-number>-short-desc`  | Bug fix               |
| `docs/<description>`             | Documentation only    |
| `chore/<description>`            | Tooling, deps, config |
| `refactor/<description>`         | Code refactoring      |

**Examples:**

- `feat/42-add-health-endpoint`
- `fix/17-hydration-error-knowledge-list`
- `docs/update-contributing-guide`

Keep branches short-lived and focused on a single issue or concern.

---

## Pull Request Flow

1. **Fork** the repository and create a branch following the [branch convention](#branch-convention)
2. **Make your changes** with commits following the [commit convention](#commit-convention)
3. **Run checks locally** before opening a PR:
   ```bash
   npm run lint
   npm run build
   npm run test
   ```
4. **Open a Draft PR** early if you want feedback before it's ready
5. **Self-review** your diff — check for debug code, typos, and missing tests
6. **Mark as Ready for Review** when all checks pass and you're confident
7. **Link the issue** in the PR body: `Closes #<issue-number>`
8. **Respond to review feedback** by adding new commits — do **not** force-push
   or amend commits on an open PR (it makes review history harder to follow)

### Merge conditions

- CI pipeline is green (lint → build → test → merge gate)
- At least 1 approval from a code owner
- Branch is up to date with `main`

---

## Issue Labels

| Label              | Meaning                              |
| ------------------ | ------------------------------------ |
| `bug`              | Confirmed incorrect behavior         |
| `feature`          | New functionality request            |
| `good first issue` | Suitable for first-time contributors |
| `help wanted`      | Open for external contribution       |
| `documentation`    | Related to docs                      |
| `dependencies`     | Dependency update                    |
| `blocked`          | Waiting on another issue or decision |
| `wontfix`          | Will not be fixed or implemented     |

---

## Good First Issues

Issues labeled [`good first issue`](https://github.com/glaucia86/knowhub/labels/good%20first%20issue)
are specifically curated for contributors making their first contribution. They
come with full context, clear acceptance criteria, and pointers to the relevant
files.

### How to pick up an issue

1. Find an issue that interests you in the [good first issue list](https://github.com/glaucia86/knowhub/labels/good%20first%20issue)
2. Comment: _"I'd like to work on this"_
3. Wait for a maintainer to assign it to you (usually within 24 hours)
4. Fork, branch, code, and open a PR!

If you have questions, ask them directly in the issue comments — maintainers are
happy to help newcomers.

---

## Code Style

- **Language:** TypeScript (strict mode)
- **Formatter:** Prettier (`singleQuote: true`, `printWidth: 100`)
- **Linter:** ESLint v9 flat config (`eslint.config.js`)
- **Pre-commit:** `lint-staged` via Husky runs lint automatically on staged files

Run the linter manually:

```bash
npm run lint
```

Prettier is configured in `.prettierrc`. Most editors will format on save if you
install the Prettier extension.

---

## Testing

```bash
# Run all tests
npm run test

# Run tests for a specific workspace
npm run test -w @knowhub/api
npm run test -w @knowhub/shared-utils
```

When contributing a new feature or bug fix, please add or update tests to cover
your changes. PRs without tests for new behavior may be asked to add them before
merging.

---

## License and CLA

By submitting a Pull Request, you agree that your contribution will be licensed
under the [MIT License](LICENSE). **No Contributor License Agreement (CLA) is
required** — you retain copyright of your contributions.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating. We
are committed to maintaining a welcoming and inclusive community.

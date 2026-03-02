# Security Policy

## Supported Versions

| Version        | Supported |
| -------------- | --------- |
| main (latest)  | ✅        |
| older branches | ❌        |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Disclosing a vulnerability publicly before a fix is available puts all users at
risk. Please use one of the private channels below.

### Option 1 — GitHub Private Vulnerability Reporting (preferred)

Go to the [Security tab → Report a vulnerability](../../security/advisories/new)
in this repository and fill out the form. This keeps the report private and
tracked within GitHub.

### Option 2 — Email

Send a detailed report to **security@knowhub.dev**.

Encrypt your message with our PGP key if the information is highly sensitive
(key available on request).

### What to include

Please provide as much of the following information as possible:

- **Description** of the vulnerability and its potential impact
- **Steps to reproduce** (proof-of-concept or exploit code is helpful)
- **Affected component** (API, Web, CLI, shared packages, Docker setup)
- **KnowHub version or commit SHA**
- **Suggested fix** (optional, but appreciated)

### Response timeline

| Stage             | Target time                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| Acknowledgment    | Within **48 hours** of receipt                                          |
| Status update     | Within **7 days** — initial assessment and next steps                   |
| Fix or mitigation | Within **90 days** — or we coordinate a public disclosure date with you |

We follow responsible disclosure: we will not publicly disclose vulnerability
details until a fix is available (or the 90-day window expires). We will credit
the reporter in the release notes unless they prefer to remain anonymous.

## Scope

The following are **in scope**:

- Remote code execution (RCE)
- Authentication and authorization bypass
- Injection vulnerabilities (SQL, command, path traversal)
- Sensitive data exposure (API keys, local file contents)
- Denial of service affecting the local development environment
- Vulnerabilities in the Docker Compose setup that expose services externally

The following are **out of scope**:

- Issues requiring physical access to the machine running KnowHub
- Vulnerabilities in third-party dependencies (please report those upstream)
- Issues already publicly disclosed in the GitHub issue tracker
- Social engineering attacks

## Disclosure Policy

We ask that you:

1. Give us reasonable time to fix the issue before any public disclosure
2. Make a good faith effort to avoid data destruction or service disruption
3. Not access or modify data that doesn't belong to you

We commit to:

1. Responding promptly and keeping you informed throughout the process
2. Not pursuing legal action against researchers acting in good faith
3. Crediting you in the fix announcement (unless you prefer anonymity)

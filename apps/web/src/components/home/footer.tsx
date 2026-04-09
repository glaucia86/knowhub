import React from 'react';
import { BookOpen, Github } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Privacy', href: '#privacy' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API Docs', href: 'http://localhost:3001/api/docs', external: true },
      {
        label: 'CONTRIBUTING',
        href: 'https://github.com/glaucia86/knowhub/blob/main/CONTRIBUTING.md',
        external: true,
      },
      {
        label: 'Changelog',
        href: 'https://github.com/glaucia86/knowhub/blob/main/CHANGELOG.md',
        external: true,
      },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: 'https://github.com/glaucia86/knowhub', external: true },
      {
        label: 'Code of Conduct',
        href: 'https://github.com/glaucia86/knowhub/blob/main/CODE_OF_CONDUCT.md',
        external: true,
      },
      {
        label: 'Security',
        href: 'https://github.com/glaucia86/knowhub/blob/main/SECURITY.md',
        external: true,
      },
    ],
  },
] as const;

const techStack = ['Ollama', 'TypeScript', 'NestJS', 'PostgreSQL', 'Drizzle', 'Next.js'] as const;

export function Footer(): React.JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--kh-border)] bg-[var(--kh-ink)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        {/* Top grid */}
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand column */}
          <div className="space-y-4">
            <a
              href="/"
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)] rounded-lg w-fit"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--kh-highlight)] to-[var(--kh-accent)]">
                <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-base font-bold tracking-tight">KnowHub</span>
            </a>
            <p className="text-sm leading-relaxed text-white/55">
              Your private, local-first AI knowledge base. Capture anything, find everything, trust
              no cloud.
            </p>
            <a
              href="https://github.com/glaucia86/knowhub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)]"
            >
              <Github className="h-3.5 w-3.5" />
              Star on GitHub
            </a>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                {group.title}
              </h3>
              <ul className="space-y-2" role="list">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={'external' in link && link.external ? '_blank' : undefined}
                      rel={'external' in link && link.external ? 'noreferrer' : undefined}
                      className="text-sm text-white/55 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)] rounded"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech badges */}
        <div className="mt-10 border-t border-white/[0.08] pt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-white/35">
            Powered by
          </p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/55"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6 text-xs text-white/35">
          <p>© {year} KnowHub — MIT License. Open Source, forever.</p>
          <p>Built with care for knowledge workers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

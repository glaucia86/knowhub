'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Github, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
  { href: '/ingest', label: 'Ingestion Lab' },
] as const;

function KnowHubLogo(): React.JSX.Element {
  return (
    <a
      href="/"
      aria-label="KnowHub home"
      className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)] rounded-lg"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--kh-highlight)] to-[var(--kh-accent)]">
        <BookOpen className="h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      <span className="text-sm font-bold tracking-tight text-white">KnowHub</span>
    </a>
  );
}

export function NavBar(): React.JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/[0.06]"
      style={{
        background: 'rgb(15 36 56 / 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3 md:px-10">
        <KnowHubLogo />

        <ul className="hidden items-center gap-0.5 md:flex" role="list">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)]"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://github.com/glaucia86/knowhub"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-white/75 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)]"
          >
            <Github className="h-3.5 w-3.5" strokeWidth={2} />
            GitHub
          </a>
          <a
            href="/ingest"
            className="kh-glow rounded-lg bg-[var(--kh-highlight)] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#368f7c] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Test Ingestion
          </a>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)] md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06] md:hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-1" role="list">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li className="mt-3 flex flex-col gap-2">
                <a
                  href="https://github.com/glaucia86/knowhub"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/75"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
                <a
                  href="/ingest"
                  className="rounded-lg bg-[var(--kh-highlight)] px-4 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Test Ingestion
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

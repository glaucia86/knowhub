'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  BookMarked,
  Brain,
  CloudOff,
  Code2,
  Cpu,
  Download,
  Github,
  GraduationCap,
  Microscope,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { Footer } from './footer';
import { NavBar } from './nav-bar';
import {
  motionContainer,
  motionFadeUp,
  motionHoverLift,
  motionScaleIn,
} from '../../lib/motion-presets';

// ─── Data ─────────────────────────────────────────────────────────────────────

const heroPills = [
  { icon: ShieldCheck, label: '100% Local' },
  { icon: CloudOff, label: 'Zero Cloud' },
  { icon: Code2, label: 'Open Source · MIT' },
] as const;

const terminalLines = [
  { prompt: true, text: 'ask "what were my notes on auth tokens?"' },
  { prompt: false, text: '→ Found 3 related entries from last week.' },
  { prompt: false, text: '  · JWT refresh flow (note, 2d ago)' },
  { prompt: false, text: '  · Auth module spec (link, 5d ago)' },
  { prompt: false, text: '  · OAuth research PDF (indexed, 1w ago)' },
] as const;

const statsData = [
  {
    icon: ShieldCheck,
    value: '100%',
    numericValue: 100 as number | null,
    suffix: '%',
    label: 'Private & Local',
    color: 'text-[var(--kh-highlight)]',
  },
  {
    icon: CloudOff,
    value: '0',
    numericValue: 0 as number | null,
    suffix: '',
    label: 'Cloud Upload',
    color: 'text-[var(--kh-accent)]',
  },
  {
    icon: Terminal,
    value: '3',
    numericValue: 3 as number | null,
    suffix: '',
    label: 'Interfaces: CLI · API · Web',
    color: 'text-sky-400',
  },
  {
    icon: Code2,
    value: 'MIT',
    numericValue: null as number | null,
    suffix: '',
    label: 'Open Source License',
    color: 'text-purple-400',
  },
];

const valueCards = [
  {
    icon: Zap,
    iconColor: 'bg-[var(--kh-accent)]/12 text-[var(--kh-accent)]',
    title: 'Capture in seconds',
    description:
      'Save notes, links and documents without deciding folders first. KnowHub ingests anything.',
  },
  {
    icon: Search,
    iconColor: 'bg-[var(--kh-highlight)]/12 text-[var(--kh-highlight)]',
    title: "Ask, don't browse",
    description:
      'Find what matters using natural language. No folders, no tags, no keyword guessing.',
  },
  {
    icon: Network,
    iconColor: 'bg-sky-500/12 text-sky-500',
    title: 'Discover hidden links',
    description: 'Reveal connections across projects, classes and research threads automatically.',
  },
] as const;

const cloudVsLocal = [
  { cloud: 'Uploads your notes to remote servers', local: 'Runs entirely on your device' },
  { cloud: 'Requires a monthly subscription', local: 'Free and open source forever' },
  { cloud: 'Locks data in proprietary formats', local: 'Your data, your formats, your way' },
  { cloud: 'Goes dark without internet', local: 'Works offline, no dependencies' },
  { cloud: 'Company can read your notes', local: 'Only you can access your knowledge' },
] as const;

const workflowSteps = [
  {
    step: '01',
    icon: Download,
    iconColor: 'bg-[var(--kh-accent)]/15 text-[var(--kh-accent)]',
    title: 'Drop anything in',
    description:
      'Text snippets, URLs, PDFs and GitHub issues go into one private knowledge workspace.',
  },
  {
    step: '02',
    icon: Cpu,
    iconColor: 'bg-[var(--kh-highlight)]/15 text-[var(--kh-highlight)]',
    title: 'AI structures context',
    description:
      'KnowHub summarizes, links related concepts and keeps your knowledge graph coherent.',
  },
  {
    step: '03',
    icon: Sparkles,
    iconColor: 'bg-sky-500/15 text-sky-500',
    title: 'Query and act faster',
    description: 'Ask follow-up questions and reuse your knowledge directly in real tasks.',
  },
] as const;

const audienceItems = [
  { icon: Code2, label: 'Developers' },
  { icon: Microscope, label: 'Researchers' },
  { icon: Brain, label: 'Designers' },
  { icon: GraduationCap, label: 'Professors' },
  { icon: BookMarked, label: 'Students' },
  { icon: Users, label: 'Consultants' },
  { icon: User, label: 'Creators' },
] as const;

const techStack = [
  'Ollama',
  'TypeScript',
  'NestJS',
  'PostgreSQL',
  'Drizzle ORM',
  'Next.js',
] as const;
// ─── Animated helpers ─────────────────────────────────────────────────────────────────────────────

/** Terminal with typewriter reveal — each line fades in sequentially. */
function AnimatedTerminal(): React.JSX.Element {
  const [visibleCount, setVisibleCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleCount(terminalLines.length);
      return;
    }
    const timers = terminalLines.map((_, i) =>
      window.setTimeout(() => setVisibleCount(i + 1), 500 + i * 560),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [shouldReduceMotion]);

  return (
    <motion.aside
      className="kh-terminal overflow-hidden"
      aria-label="KnowHub CLI demo"
      {...motionScaleIn}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-[var(--kh-highlight)]/80" />
        <span className="ml-3 text-xs font-medium text-white/30">knowhub — CLI</span>
      </div>
      {/* Animated lines */}
      <div className="min-h-[172px] space-y-1 p-5 text-sm leading-relaxed">
        {terminalLines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={i < visibleCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={
              line.prompt ? 'font-mono text-[var(--kh-highlight)]' : 'font-mono text-white/55'
            }
          >
            {line.prompt && <span className="mr-2 text-white/30">$</span>}
            {line.text}
          </motion.p>
        ))}
        <motion.p
          className="mt-3 font-mono text-[var(--kh-highlight)]"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ▌
        </motion.p>
      </div>
    </motion.aside>
  );
}

/** Count-up number that triggers on scroll-into-view. */
function AnimatedCounter({
  numericValue,
  suffix,
  staticValue,
}: {
  numericValue: number | null;
  suffix: string;
  staticValue: string;
}): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapperRef, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (numericValue === null) return;
    if (!isInView) return;
    if (shouldReduceMotion) {
      setCount(numericValue);
      return;
    }
    const controls = animate(0, numericValue, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v: number) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, numericValue, shouldReduceMotion]);

  if (numericValue === null) {
    return <strong className="text-2xl font-bold tracking-tight text-white">{staticValue}</strong>;
  }

  return (
    <div ref={wrapperRef}>
      <strong className="text-2xl font-bold tracking-tight text-white tabular-nums">
        {count}
        {suffix}
      </strong>
    </div>
  );
}
// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const spotX = useTransform(mouseX, (v) => v - 160);
  const spotY = useTransform(mouseY, (v) => v - 160);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-9999);
    mouseY.set(-9999);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative grid gap-10 overflow-hidden pt-16 pb-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mouse-tracking spotlight */}
      <motion.div
        className="pointer-events-none absolute h-80 w-80 rounded-full blur-[80px] opacity-[0.15]"
        style={{ background: 'var(--kh-highlight)', x: spotX, y: spotY }}
        aria-hidden
      />
      {/* Floating background orbs */}
      <div
        className="animate-orb-drift pointer-events-none absolute -top-12 left-1/3 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'rgb(45 111 96 / 0.09)' }}
        aria-hidden
      />
      <div
        className="animate-orb-drift-inverse pointer-events-none absolute -bottom-8 right-1/4 h-56 w-56 rounded-full blur-3xl"
        style={{ background: 'rgb(200 145 58 / 0.11)' }}
        aria-hidden
      />
      {/* Left: copy */}
      <div className="relative space-y-7">
        {/* Social-proof pills */}
        <div className="flex flex-wrap items-center gap-2">
          {heroPills.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--kh-border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--kh-muted)] backdrop-blur"
            >
              <Icon className="h-3 w-3 text-[var(--kh-highlight)]" strokeWidth={2.5} />
              {label}
            </span>
          ))}
        </div>

        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-balance md:text-6xl lg:text-7xl">
          Your knowledge. <span className="kh-gradient-text">Private.</span>
          <br />
          Always available.
        </h1>

        <p className="max-w-lg text-lg leading-relaxed text-[var(--kh-muted)]">
          KnowHub is a local-first AI assistant that captures, indexes and retrieves your notes,
          links and files — without sending a byte to the cloud.
        </p>

        {/* CTA row */}
        <div className="flex flex-wrap gap-3">
          <a
            href="#how-it-works"
            className="kh-glow inline-flex items-center gap-2 rounded-xl bg-[var(--kh-highlight)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)] focus-visible:ring-offset-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
          <a
            href="https://github.com/glaucia86/knowhub"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--kh-border)] bg-white/70 px-6 py-3 font-semibold text-[var(--kh-ink)] backdrop-blur transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)]"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>

      {/* Right: animated terminal — typewriter effect */}
      <AnimatedTerminal />
    </section>
  );
}

function StatsStrip(): React.JSX.Element {
  return (
    <section className="kh-section-dark rounded-3xl py-8" aria-label="Key stats">
      <div className="kh-dot-bg absolute inset-0 rounded-3xl opacity-50 pointer-events-none" />
      <ul className="relative grid grid-cols-2 gap-6 px-6 md:grid-cols-4 md:px-10" role="list">
        {statsData.map(({ icon: Icon, value, numericValue, suffix, label, color }) => (
          <li key={label} className="flex flex-col items-center gap-2 text-center">
            <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]"
              whileHover={{ scale: 1.18, backgroundColor: 'rgb(255 255 255 / 0.13)' }}
              transition={{ type: 'spring' as const, stiffness: 380, damping: 18 }}
            >
              <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.75} />
            </motion.span>
            <AnimatedCounter numericValue={numericValue} suffix={suffix} staticValue={value} />
            <span className="text-xs font-medium text-white/45">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ValueSection(): React.JSX.Element {
  return (
    <section className="grid gap-4 md:grid-cols-3" id="features-detail">
      {valueCards.map((card) => (
        <motion.article
          key={card.title}
          className="kh-glass-panel rounded-2xl p-6 space-y-3"
          {...motionHoverLift}
        >
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconColor}`}
          >
            <card.icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="text-base font-semibold text-[var(--kh-ink)]">{card.title}</h3>
          <p className="text-sm leading-relaxed text-[var(--kh-muted)]">{card.description}</p>
        </motion.article>
      ))}
    </section>
  );
}

function WhyLocalSection(): React.JSX.Element {
  const rowsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowsRef, { once: true, margin: '-80px' });

  return (
    <section
      id="privacy"
      className="kh-section-dark relative overflow-hidden rounded-3xl px-6 py-10 md:px-10"
    >
      <div className="kh-dot-bg absolute inset-0 rounded-3xl opacity-40 pointer-events-none" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--kh-highlight)]/40 bg-[var(--kh-highlight)]/10 px-3 py-1 text-xs font-semibold text-[var(--kh-highlight)]">
          <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
          Why local-first?
        </span>
        <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
          Privacy is not a feature. It&apos;s the foundation.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
          Most tools trade your knowledge for convenience. KnowHub doesn&apos;t.
        </p>

        <div ref={rowsRef} className="mt-8 grid gap-3 md:grid-cols-2">
          {/* Cloud column */}
          <div className="space-y-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-400/80">
              ✕ Cloud-based tools
            </p>
            {cloudVsLocal.map(({ cloud }, i) => (
              <motion.div
                key={cloud}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.42, ease: 'easeOut' }}
                className="flex items-start gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3"
              >
                <span className="mt-0.5 text-sm text-red-400">✕</span>
                <span className="text-sm text-white/50">{cloud}</span>
              </motion.div>
            ))}
          </div>
          {/* KnowHub column */}
          <div className="space-y-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--kh-highlight)]">
              ✓ KnowHub
            </p>
            {cloudVsLocal.map(({ local }, i) => (
              <motion.div
                key={local}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 + 0.06, duration: 0.42, ease: 'easeOut' }}
                className="flex items-start gap-2.5 rounded-xl border border-[var(--kh-highlight)]/20 bg-[var(--kh-highlight)]/[0.07] px-4 py-3"
              >
                <span className="mt-0.5 text-sm text-[var(--kh-highlight)]">✓</span>
                <span className="text-sm text-white/70">{local}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection(): React.JSX.Element {
  return (
    <section id="how-it-works" className="kh-glass-panel rounded-3xl p-6 md:p-10">
      <div className="text-center">
        <span className="inline-block rounded-full border border-[var(--kh-border)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--kh-muted)]">
          How it works
        </span>
        <h2 className="mt-3 text-2xl font-bold text-[var(--kh-ink)] md:text-3xl">
          Three steps to a connected knowledge base
        </h2>
        <p className="mt-2 text-sm text-[var(--kh-muted)]">
          Designed for clarity, not maintenance overhead.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {workflowSteps.map((item, index) => (
          <article
            key={item.step}
            className="relative rounded-2xl border border-[var(--kh-border)] bg-white/80 p-5"
          >
            {/* Connector line (desktop only) */}
            {index < workflowSteps.length - 1 && (
              <span
                className="absolute -right-2 top-6 hidden h-px w-4 bg-[var(--kh-border)] md:block z-10"
                aria-hidden
              />
            )}
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.iconColor}`}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-xs font-bold tracking-[0.14em] text-[var(--kh-muted)]">
              {item.step}
            </p>
            <h3 className="mt-1 text-base font-semibold text-[var(--kh-ink)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--kh-muted)]">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AudienceSection(): React.JSX.Element {
  return (
    <section className="kh-glass-panel rounded-3xl p-6 md:p-10 text-center">
      <h2 className="text-2xl font-bold text-[var(--kh-ink)] md:text-3xl">
        Built for knowledge workers of all kinds
      </h2>
      <p className="mt-2 max-w-xl mx-auto text-sm text-[var(--kh-muted)]">
        Technical or non-technical — if you rely on knowledge to do great work, KnowHub is for you.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {audienceItems.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--kh-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--kh-ink)] backdrop-blur"
          >
            <Icon className="h-3.5 w-3.5 text-[var(--kh-highlight)]" strokeWidth={2} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function TechBadgesSection(): React.JSX.Element {
  return (
    <section
      className="flex flex-wrap items-center justify-center gap-3 py-4"
      aria-label="Technology stack"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--kh-muted)]">
        Powered by
      </span>
      {techStack.map((tech) => (
        <span
          key={tech}
          className="rounded-full border border-[var(--kh-border)] bg-white/70 px-3 py-1 text-xs font-medium text-[var(--kh-muted)] backdrop-blur"
        >
          {tech}
        </span>
      ))}
    </section>
  );
}

function FinalCta(): React.JSX.Element {
  return (
    <section className="kh-section-dark relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white md:px-10 md:py-20">
      <div className="kh-dot-bg absolute inset-0 rounded-3xl opacity-40 pointer-events-none" />
      {/* Central glow — pulsing */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-96 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgb(45 111 96) 0%, transparent 70%)' }}
        animate={{ opacity: [0.18, 0.34, 0.18], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/60">
          KnowHub AI Assistant
        </span>
        <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          From scattered notes
          <br />
          to connected thinking.
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-base text-white/55 leading-relaxed">
          Start local, stay private, and make your accumulated knowledge immediately useful in your
          day-to-day work.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-[var(--kh-ink)] transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--kh-ink)]"
          >
            Start with KnowHub
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
          <a
            href="https://github.com/glaucia86/knowhub"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.06] px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

const sections = [
  HeroSection,
  StatsStrip,
  ValueSection,
  WhyLocalSection,
  WorkflowSection,
  AudienceSection,
  TechBadgesSection,
  FinalCta,
] as const;

export function HomeExperience(): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 md:px-10">
      {sections.map((Section, i) =>
        shouldReduceMotion ? (
          <Section key={i} />
        ) : (
          <motion.div key={i} variants={motionFadeUp}>
            <Section />
          </motion.div>
        ),
      )}
    </div>
  );

  return (
    <>
      <NavBar />
      <main className="kh-ultra-bg relative overflow-hidden text-[var(--kh-ink)]">
        {shouldReduceMotion ? (
          content
        ) : (
          <motion.div variants={motionContainer} initial="hidden" animate="visible">
            {content}
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}

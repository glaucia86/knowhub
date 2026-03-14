'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  Key,
  Link2,
  Loader2,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Footer } from '../../src/components/home/footer';
import { NavBar } from '../../src/components/home/nav-bar';

type EndpointKey = 'text' | 'url' | 'file';

type TestResponse = {
  ok: boolean;
  status: number;
  body: unknown;
};

type HistoryItem = {
  id: string;
  endpoint: EndpointKey;
  at: string;
  status: number;
  ok: boolean;
  summary: string;
};

const defaultApiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function endpointLabel(endpoint: EndpointKey): string {
  if (endpoint === 'text') return '/ingest/text';
  if (endpoint === 'url') return '/ingest/url';
  return '/ingest/file';
}

function resultSummary(result: TestResponse): string {
  if (typeof result.body === 'object' && result.body !== null && 'message' in result.body) {
    const message = (result.body as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.join(' | ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return result.ok ? 'Request completed successfully.' : 'Request failed.';
}

function EndpointStatusPill({
  label,
  response,
}: {
  label: string;
  response: TestResponse | null;
}): React.JSX.Element {
  const tone = !response
    ? 'border-[var(--kh-border)] text-[var(--kh-muted)] bg-white/80'
    : response.ok
      ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
      : 'border-rose-300 text-rose-700 bg-rose-50';

  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
    >
      {label}
      {response ? `HTTP ${response.status}` : 'idle'}
    </motion.span>
  );
}

function SectionFrame({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <section className="kh-glass-panel rounded-2xl p-5 md:p-6">{children}</section>;
}

function EndpointCard({
  title,
  subtitle,
  icon,
  accentClass,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <motion.section
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="kh-glass-panel rounded-2xl overflow-hidden"
    >
      <div className={`h-1.5 w-full ${accentClass}`} />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--kh-ink)]">{title}</h2>
            <p className="mt-1 text-xs text-[var(--kh-muted)]">{subtitle}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--kh-highlight)]/12 text-[var(--kh-highlight)]">
            {icon}
          </span>
        </div>
        {children}
      </div>
    </motion.section>
  );
}

export default function IngestionLabPage(): React.JSX.Element {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [token, setToken] = useState('');

  const [textContent, setTextContent] = useState('Conteudo de teste EPIC 1.3');
  const [textTitle, setTextTitle] = useState('Teste browser - text');

  const [urlValue, setUrlValue] = useState('https://example.com');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlForce, setUrlForce] = useState(false);

  const [fileTitle, setFileTitle] = useState('');
  const [fileValue, setFileValue] = useState<File | null>(null);

  const [loading, setLoading] = useState<EndpointKey | null>(null);
  const [result, setResult] = useState<TestResponse | null>(null);
  const [endpointResults, setEndpointResults] = useState<Record<EndpointKey, TestResponse | null>>({
    text: null,
    url: null,
    file: null,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  const [tokenGenError, setTokenGenError] = useState<string | null>(null);

  const authHeader = useMemo(() => token.trim(), [token]);

  async function requestJson(input: RequestInfo | URL, init?: RequestInit): Promise<TestResponse> {
    const response = await fetch(input, init);
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      body = { message: 'Resposta sem JSON' };
    }

    return {
      ok: response.ok,
      status: response.status,
      body,
    };
  }

  function track(endpoint: EndpointKey, response: TestResponse): void {
    setResult(response);
    setEndpointResults((previous) => ({ ...previous, [endpoint]: response }));
    setHistory((previous) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          endpoint,
          at: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
          status: response.status,
          ok: response.ok,
          summary: resultSummary(response),
        },
        ...previous,
      ].slice(0, 8),
    );
  }

  async function handleLocalToken(): Promise<void> {
    setTokenLoading(true);
    setTokenGenError(null);
    try {
      const response = await fetch(`${apiBase}/api/v1/auth/local-token`, {
        method: 'POST',
      });
      const data = (await response.json()) as Record<string, unknown>;
      if (response.ok && typeof data.accessToken === 'string') {
        setToken(data.accessToken);
        setTokenExpiry(typeof data.expiresAt === 'string' ? data.expiresAt : null);
        setShowTokenHelp(false);
      } else {
        const raw = data.message;
        const msg = Array.isArray(raw)
          ? (raw as string[]).join(' | ')
          : typeof raw === 'string'
            ? raw
            : 'Falha ao gerar token. Execute o setup primeiro.';
        setTokenGenError(msg);
      }
    } catch {
      setTokenGenError('Falha na conexão com a API. Verifique se o servidor está rodando.');
    } finally {
      setTokenLoading(false);
    }
  }

  async function copyResponse(): Promise<void> {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(prettyJson(result.body));
      setCopyMessage('JSON copiado.');
      window.setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage('Falha ao copiar JSON.');
      window.setTimeout(() => setCopyMessage(null), 2000);
    }
  }

  async function copyCommand(label: string, command: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(command);
      setCopyMessage(`${label} cURL copiado.`);
      window.setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage(`Falha ao copiar cURL de ${label}.`);
      window.setTimeout(() => setCopyMessage(null), 2000);
    }
  }

  function buildTextCurl(): string {
    const payload = {
      content: textContent,
      title: textTitle || undefined,
    };

    return `curl.exe -X POST "${apiBase}/api/v1/ingest/text" -H "Authorization: Bearer ${authHeader || '<TOKEN>'}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`;
  }

  function buildUrlCurl(): string {
    const payload = {
      url: urlValue,
      title: urlTitle || undefined,
    };
    const query = urlForce ? '?force=true' : '';

    return `curl.exe -X POST "${apiBase}/api/v1/ingest/url${query}" -H "Authorization: Bearer ${authHeader || '<TOKEN>'}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`;
  }

  function buildFileCurl(): string {
    const typeHint = fileValue?.type || '<MIME_TYPE>';
    const fileNameHint = fileValue?.name || '<ARQUIVO>';
    const titlePart = fileTitle.trim() ? ` -F "title=${fileTitle.trim()}"` : '';

    return `curl.exe -X POST "${apiBase}/api/v1/ingest/file" -H "Authorization: Bearer ${authHeader || '<TOKEN>'}" -F "file=@${fileNameHint};type=${typeHint}"${titlePart}`;
  }

  async function runRequest(
    endpoint: EndpointKey,
    action: () => Promise<TestResponse>,
  ): Promise<void> {
    setLoading(endpoint);
    setResult(null);

    const response = await action();
    track(endpoint, response);
    setLoading(null);
  }

  async function handleTextSubmit(): Promise<void> {
    const payload = {
      content: textContent,
      title: textTitle || undefined,
    };

    await runRequest('text', () =>
      requestJson(`${apiBase}/api/v1/ingest/text`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
    );
  }

  async function handleUrlSubmit(): Promise<void> {
    const payload = {
      url: urlValue,
      title: urlTitle || undefined,
    };

    const query = urlForce ? '?force=true' : '';
    await runRequest('url', () =>
      requestJson(`${apiBase}/api/v1/ingest/url${query}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
    );
  }

  async function handleFileSubmit(): Promise<void> {
    if (!fileValue) {
      track('file', {
        ok: false,
        status: 0,
        body: { message: 'Selecione um arquivo antes de enviar.' },
      });
      return;
    }

    const form = new FormData();
    form.append('file', fileValue);
    if (fileTitle.trim()) {
      form.append('title', fileTitle.trim());
    }

    await runRequest('file', () =>
      requestJson(`${apiBase}/api/v1/ingest/file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authHeader}`,
        },
        body: form,
      }),
    );
  }

  const responseTone = result
    ? result.ok
      ? 'text-emerald-600'
      : 'text-rose-600'
    : 'text-[var(--kh-muted)]';

  return (
    <>
      <NavBar />
      <main className="kh-ultra-bg relative overflow-hidden text-[var(--kh-ink)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-10 md:px-10">
          <motion.header
            {...fadeUp}
            transition={{ duration: 0.32 }}
            className="kh-glass-panel rounded-3xl p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--kh-border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--kh-muted)]">
                <FlaskConical className="h-3.5 w-3.5 text-[var(--kh-highlight)]" />
                EPIC-1.3 Validation Lab
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--kh-border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--kh-muted)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--kh-highlight)]" />
                UI aligned with Home
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Ingestion Playground
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--kh-muted)] md:text-base">
              Teste os fluxos de ingestão no browser com a mesma linguagem visual da homepage.
              Tokens, requests, respostas e historico ficam em um unico painel.
            </p>

            <AnimatePresence>
              {copyMessage ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 text-xs font-semibold text-[var(--kh-highlight)]"
                >
                  {copyMessage}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap gap-2">
              <EndpointStatusPill label="Text" response={endpointResults.text} />
              <EndpointStatusPill label="URL" response={endpointResults.url} />
              <EndpointStatusPill label="File" response={endpointResults.file} />
            </div>
          </motion.header>

          <motion.div {...fadeUp} transition={{ duration: 0.34, delay: 0.03 }}>
            <SectionFrame>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Conexão</h2>
                <button
                  type="button"
                  onClick={() => setShowTokenHelp((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--kh-border)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--kh-muted)] transition hover:bg-white"
                >
                  <Key className="h-3.5 w-3.5 text-[var(--kh-highlight)]" />
                  {showTokenHelp ? 'Fechar' : 'Como gerar um token?'}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${showTokenHelp ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              <AnimatePresence>
                {showTokenHelp && (
                  <motion.div
                    key="token-help"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-xl border border-[var(--kh-border)] bg-[var(--kh-ink)]/[0.03] p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--kh-muted)]">
                        Passo 1 — Execute o setup (apenas uma vez)
                      </p>
                      <div className="flex items-center gap-2 rounded-lg bg-[var(--kh-ink)] px-3 py-2">
                        <code className="flex-1 font-mono text-xs text-white/85">
                          node apps/cli/dist/index.js setup
                        </code>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              'node apps/cli/dist/index.js setup',
                            );
                            setCopyMessage('Comando copiado.');
                            window.setTimeout(() => setCopyMessage(null), 2000);
                          }}
                          className="shrink-0 rounded p-0.5 text-white/50 transition hover:text-white"
                          aria-label="Copiar comando"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mb-3 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--kh-muted)]">
                        Passo 2 — Gere o token com um clique
                      </p>
                      <p className="mb-3 text-xs text-[var(--kh-muted)]">
                        O servidor lê suas credenciais locais automaticamente (
                        <code className="rounded bg-white/70 px-1 font-mono">
                          ~/.knowhub/config.json
                        </code>{' '}
                        e o Credential Store do OS). Nenhum dado precisa ser copiado manualmente.
                      </p>
                      {tokenGenError && (
                        <p className="mb-3 flex items-center gap-1.5 text-xs text-rose-600">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {tokenGenError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleLocalToken()}
                        disabled={tokenLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--kh-highlight)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#368f7c] disabled:opacity-50"
                      >
                        {tokenLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Key className="h-4 w-4" />
                        )}
                        {tokenLoading ? 'Gerando...' : 'Gerar e preencher token'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label htmlFor="api-base-url" className="grid gap-1 text-sm">
                  API base URL
                  <input
                    id="api-base-url"
                    className="rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2"
                    value={apiBase}
                    onChange={(event) => setApiBase(event.target.value)}
                    placeholder="http://localhost:3001"
                  />
                </label>
                <div className="grid gap-1 text-sm md:col-span-2">
                  <label htmlFor="bearer-token" className="flex items-center gap-2">
                    Bearer token
                    {tokenExpiry && (
                      <span className="text-xs font-normal text-emerald-600">
                        ✓ expira às{' '}
                        {new Date(tokenExpiry).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="bearer-token"
                      type={showToken ? 'text' : 'password'}
                      className="w-full rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 pr-10 font-mono text-xs"
                      value={token}
                      onChange={(event) => {
                        setToken(event.target.value);
                        setTokenExpiry(null);
                      }}
                      placeholder="Cole aqui o accessToken ou use 'Como gerar um token?' acima"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--kh-muted)] transition hover:text-[var(--kh-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kh-highlight)]"
                      aria-label={showToken ? 'Ocultar token' : 'Exibir token'}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </SectionFrame>
          </motion.div>

          <AnimatePresence>
            {!authHeader && (
              <motion.div
                key="token-warning"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <p className="text-sm text-amber-700">
                  Configure o <strong>Bearer token</strong> na seção Conexão acima para habilitar o
                  envio das requisições.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.36, delay: 0.06 }}
            className="grid gap-5 lg:grid-cols-3"
          >
            <EndpointCard
              title="Ingest Text"
              subtitle="Teste de nota livre"
              icon={<FileText className="h-4 w-4" />}
              accentClass="bg-gradient-to-r from-emerald-500 to-emerald-300"
            >
              <div className="grid gap-2">
                <label
                  htmlFor="text-title"
                  className="grid gap-1 text-xs font-medium text-[var(--kh-muted)]"
                >
                  Título
                  <input
                    id="text-title"
                    className="w-full min-w-0 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-normal text-[var(--kh-ink)]"
                    value={textTitle}
                    onChange={(event) => setTextTitle(event.target.value)}
                    placeholder="Título da nota"
                  />
                </label>
                <label
                  htmlFor="text-content"
                  className="grid gap-1 text-xs font-medium text-[var(--kh-muted)]"
                >
                  Conteúdo <span className="text-rose-500">*</span>
                  <textarea
                    id="text-content"
                    className="w-full min-w-0 min-h-24 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-normal text-[var(--kh-ink)]"
                    value={textContent}
                    onChange={(event) => setTextContent(event.target.value)}
                    placeholder="Conteúdo da nota..."
                  />
                </label>
                <div className="grid gap-2 md:grid-cols-2">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--kh-highlight)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#368f7c] disabled:opacity-50"
                    onClick={() => void handleTextSubmit()}
                    disabled={loading !== null || !authHeader}
                  >
                    {loading === 'text' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading === 'text' ? 'Enviando...' : 'POST /ingest/text'}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-semibold text-[var(--kh-ink)] transition hover:bg-white"
                    onClick={() => void copyCommand('/ingest/text', buildTextCurl())}
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar cURL
                  </button>
                </div>
              </div>
            </EndpointCard>

            <EndpointCard
              title="Ingest URL"
              subtitle="Com deduplicação e force"
              icon={<Link2 className="h-4 w-4" />}
              accentClass="bg-gradient-to-r from-sky-500 to-cyan-300"
            >
              <div className="grid gap-2">
                <label
                  htmlFor="url-value"
                  className="grid gap-1 text-xs font-medium text-[var(--kh-muted)]"
                >
                  URL <span className="text-rose-500">*</span>
                  <input
                    id="url-value"
                    className="w-full min-w-0 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-normal text-[var(--kh-ink)]"
                    value={urlValue}
                    onChange={(event) => setUrlValue(event.target.value)}
                    placeholder="https://example.com"
                  />
                </label>
                <label
                  htmlFor="url-title"
                  className="grid gap-1 text-xs font-medium text-[var(--kh-muted)]"
                >
                  Título
                  <input
                    id="url-title"
                    className="w-full min-w-0 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-normal text-[var(--kh-ink)]"
                    value={urlTitle}
                    onChange={(event) => setUrlTitle(event.target.value)}
                    placeholder="Título opcional"
                  />
                </label>
                <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-[var(--kh-muted)]">
                  <span
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      urlForce ? 'bg-[var(--kh-highlight)]' : 'bg-[var(--kh-border)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        urlForce ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={urlForce}
                      onChange={(event) => setUrlForce(event.target.checked)}
                    />
                  </span>
                  <span>
                    force=true{' '}
                    <span className="text-xs text-[var(--kh-muted)]/70">
                      (re-ingere duplicatas)
                    </span>
                  </span>
                </label>
                <div className="grid gap-2 md:grid-cols-2">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--kh-highlight)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#368f7c] disabled:opacity-50"
                    onClick={() => void handleUrlSubmit()}
                    disabled={loading !== null || !authHeader}
                  >
                    {loading === 'url' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading === 'url' ? 'Enviando...' : 'POST /ingest/url'}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-semibold text-[var(--kh-ink)] transition hover:bg-white"
                    onClick={() => void copyCommand('/ingest/url', buildUrlCurl())}
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar cURL
                  </button>
                </div>
              </div>
            </EndpointCard>

            <EndpointCard
              title="Ingest File"
              subtitle="Upload de .txt/.md/.pdf"
              icon={<Upload className="h-4 w-4" />}
              accentClass="bg-gradient-to-r from-amber-500 to-yellow-300"
            >
              <div className="grid gap-2">
                <label
                  htmlFor="file-title"
                  className="grid gap-1 text-xs font-medium text-[var(--kh-muted)]"
                >
                  Título
                  <input
                    id="file-title"
                    className="w-full min-w-0 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-normal text-[var(--kh-ink)]"
                    value={fileTitle}
                    onChange={(event) => setFileTitle(event.target.value)}
                    placeholder="Título opcional"
                  />
                </label>
                <label
                  htmlFor="file-upload"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const dropped = e.dataTransfer.files[0];
                    if (dropped) setFileValue(dropped);
                  }}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition ${
                    isDraggingOver
                      ? 'border-[var(--kh-highlight)] bg-[var(--kh-highlight)]/5'
                      : 'border-[var(--kh-border)] bg-white/60 hover:border-[var(--kh-highlight)] hover:bg-white/80'
                  }`}
                >
                  <Upload className="h-5 w-5 text-[var(--kh-muted)]" />
                  {fileValue ? (
                    <span className="max-w-full truncate text-xs font-semibold text-[var(--kh-ink)]">
                      {fileValue.name}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--kh-muted)]">
                      Arraste ou clique — <strong>.txt</strong>, <strong>.md</strong>,{' '}
                      <strong>.pdf</strong>
                    </span>
                  )}
                  <input
                    id="file-upload"
                    className="sr-only"
                    type="file"
                    accept=".txt,.md,.pdf"
                    onChange={(event) => setFileValue(event.target.files?.[0] ?? null)}
                  />
                </label>
                {fileValue && (
                  <button
                    type="button"
                    onClick={() => setFileValue(null)}
                    className="inline-flex items-center gap-1 self-start rounded-lg border border-[var(--kh-border)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--kh-muted)] transition hover:bg-white"
                  >
                    <X className="h-3 w-3" />
                    Remover arquivo
                  </button>
                )}
                <div className="grid gap-2 md:grid-cols-2">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--kh-highlight)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#368f7c] disabled:opacity-50"
                    onClick={() => void handleFileSubmit()}
                    disabled={loading !== null || !authHeader}
                  >
                    {loading === 'file' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading === 'file' ? 'Enviando...' : 'POST /ingest/file'}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--kh-border)] bg-white/85 px-3 py-2 text-sm font-semibold text-[var(--kh-ink)] transition hover:bg-white"
                    onClick={() => void copyCommand('/ingest/file', buildFileCurl())}
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar cURL
                  </button>
                </div>
              </div>
            </EndpointCard>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.38, delay: 0.09 }}
            className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <SectionFrame>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[var(--kh-highlight)]" />
                  <h2 className="text-base font-semibold">Resposta da API</h2>
                </div>
                {result && (
                  <button
                    type="button"
                    onClick={() => void copyResponse()}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--kh-border)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--kh-muted)] transition hover:bg-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar JSON
                  </button>
                )}
              </div>
              <p className={`mt-2 text-sm font-medium ${responseTone}`}>
                {result
                  ? `HTTP ${result.status} - ${result.ok ? 'OK' : 'ERROR'}`
                  : 'Nenhuma chamada realizada.'}
              </p>
              <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-[var(--kh-ink)] p-4 text-xs text-white/90">
                {result ? prettyJson(result.body) : '{ }'}
              </pre>
            </SectionFrame>

            <SectionFrame>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[var(--kh-highlight)]" />
                  <h2 className="text-base font-semibold">Histórico curto</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--kh-border)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--kh-muted)] transition hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar
                </button>
              </div>

              {history.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--kh-muted)]">
                  Nenhuma chamada registrada ainda.
                </p>
              ) : (
                <ul className="mt-3 space-y-2" role="list">
                  <AnimatePresence initial={false}>
                    {history.map((item) => (
                      <motion.li
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-lg border border-[var(--kh-border)] bg-white/80 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <strong className="text-[var(--kh-ink)]">
                            {endpointLabel(item.endpoint)}
                          </strong>
                          <span className={item.ok ? 'text-emerald-700' : 'text-rose-700'}>
                            HTTP {item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--kh-muted)]">{item.summary}</p>
                        <p className="mt-1 text-[10px] text-[var(--kh-muted)]">{item.at}</p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </SectionFrame>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

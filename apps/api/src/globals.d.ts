declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
  platform: string;
  uptime: () => number;
};

declare const require: {
  (id: string): unknown;
  main?: unknown;
};

declare const module: unknown;

declare const console: {
  log: (...args: unknown[]) => void;
};

declare module 'keytar' {
  export function getPassword(service: string, account: string): Promise<string | null>;
  export function setPassword(service: string, account: string, password: string): Promise<void>;
  export function deletePassword(service: string, account: string): Promise<boolean>;
}

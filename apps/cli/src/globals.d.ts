declare const process: {
  version: string;
  argv: string[];
  env: Record<string, string | undefined>;
  cwd: () => string;
  platform: string;
  execPath: string;
  stdout: { write: (s: string) => void };
  stdin: unknown;
};

declare module 'keytar' {
  export function getPassword(service: string, account: string): Promise<string | null>;
  export function setPassword(service: string, account: string, password: string): Promise<void>;
  export function deletePassword(service: string, account: string): Promise<boolean>;
}

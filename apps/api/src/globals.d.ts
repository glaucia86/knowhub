declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
  platform: string;
};

declare const require: {
  (id: string): unknown;
  main?: unknown;
};

declare const module: unknown;

declare const console: {
  log: (...args: unknown[]) => void;
};

declare const process: {
  version: string;
  argv: string[];
  env: Record<string, string | undefined>;
  stdout: { write: (s: string) => void };
};

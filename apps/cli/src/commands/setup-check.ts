export function runSetupCheck(runtimeVersion: string): string {
  const match = runtimeVersion.match(/^v(\d+)\./);
  const major = match ? Number(match[1]) : NaN;
  if (!Number.isFinite(major) || major < 20) {
    return 'Setup check failed: Node.js >=20 is required.';
  }
  return 'Setup check passed: environment ready.';
}

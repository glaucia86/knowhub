import type { QualityGate } from '@knowhub/shared-types';

export function formatGateFeedback(gate: QualityGate): string {
  const prefix = gate.result === 'pass' ? 'PASS' : 'FAIL';
  return `[${prefix}] ${gate.gateName}: ${gate.feedback}`;
}

export function hasBlockingFailure(gates: QualityGate[]): boolean {
  return gates.some((gate) => gate.severity === 'critical' && gate.result === 'fail');
}

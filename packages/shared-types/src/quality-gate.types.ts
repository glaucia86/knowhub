export type GateSeverity = 'critical' | 'major' | 'minor';
export type GateResult = 'pass' | 'fail';

export interface QualityGate {
  gateId: string;
  gateName: string;
  severity: GateSeverity;
  result: GateResult;
  evaluatedAt: string;
  feedback: string;
}

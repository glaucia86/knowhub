import type { QualityGate } from '@knowhub/shared-types';
import { hasBlockingFailure } from '@knowhub/shared-utils';

export class QualityGatesService {
  validate(
    environmentId: string,
    gates: QualityGate[],
  ): { environmentId: string; overallResult: 'pass' | 'fail'; blockingFailures: QualityGate[] } {
    const blockingFailures = gates.filter(
      (gate) => gate.severity === 'critical' && gate.result === 'fail',
    );
    return {
      environmentId,
      overallResult: hasBlockingFailure(gates) ? 'fail' : 'pass',
      blockingFailures,
    };
  }
}

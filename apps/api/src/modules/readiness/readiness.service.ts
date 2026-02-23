import type { ContributorEnvironment } from '@knowhub/shared-types';

export class ReadinessService {
  evaluate(
    input: Omit<ContributorEnvironment, 'workspaceReady' | 'readinessScore' | 'lastValidationAt'>,
  ): ContributorEnvironment {
    const match = input.runtimeVersion.match(/^v?(\d+)\./i);
    const major = match ? Number(match[1]) : NaN;
    const workspaceReady = Number.isFinite(major) && major >= 20;
    const readinessScore = workspaceReady ? 95 : 50;
    return {
      ...input,
      workspaceReady,
      readinessScore,
      lastValidationAt: new Date().toISOString(),
    };
  }
}

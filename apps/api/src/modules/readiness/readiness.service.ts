import type { ContributorEnvironment } from '@knowhub/shared-types';

export class ReadinessService {
  evaluate(
    input: Omit<ContributorEnvironment, 'workspaceReady' | 'readinessScore' | 'lastValidationAt'>,
  ): ContributorEnvironment {
    const workspaceReady = input.runtimeVersion.startsWith('20.');
    const readinessScore = workspaceReady ? 95 : 50;
    return {
      ...input,
      workspaceReady,
      readinessScore,
      lastValidationAt: new Date().toISOString(),
    };
  }
}

export type Platform = 'windows' | 'linux' | 'macos';

export interface ContributorEnvironment {
  environmentId: string;
  contributorProfile: 'new' | 'returning';
  platform: Platform;
  runtimeVersion: string;
  workspaceReady: boolean;
  readinessScore: number;
  setupDurationSeconds?: number;
  lastValidationAt: string;
}

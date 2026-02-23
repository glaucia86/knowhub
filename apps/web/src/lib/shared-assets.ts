import type { SharedAsset } from '@knowhub/shared-types';

export async function fetchSharedAssetPropagation(assetId: string): Promise<SharedAsset> {
  return {
    assetId,
    assetType: 'type-contract',
    versionTag: '0.1.0',
    ownerScope: 'platform',
    propagationStatus: 'propagated',
    consumingSurfaces: ['api', 'web', 'cli'],
    lastUpdatedAt: new Date().toISOString(),
  };
}

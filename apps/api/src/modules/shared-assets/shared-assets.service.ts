import type { SharedAsset } from '@knowhub/shared-types';
import { isAssetConsistent } from '@knowhub/shared-utils';

export class SharedAssetsService {
  getPropagationReport(assetId: string): SharedAsset {
    const asset: SharedAsset = {
      assetId,
      assetType: 'type-contract',
      versionTag: '0.1.0',
      ownerScope: 'platform',
      propagationStatus: 'propagated',
      consumingSurfaces: ['api', 'web', 'cli'],
      lastUpdatedAt: new Date().toISOString(),
    };

    if (!isAssetConsistent(asset)) {
      return { ...asset, propagationStatus: 'diverged' };
    }

    return asset;
  }
}

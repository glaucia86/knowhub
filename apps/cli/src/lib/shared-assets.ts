import type { SharedAsset } from '@knowhub/shared-types';

export function readSharedAssetStatus(asset: SharedAsset): string {
  return `${asset.assetId}:${asset.propagationStatus}`;
}

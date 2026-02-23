import type { SharedAsset } from '@knowhub/shared-types';

export function isAssetConsistent(asset: SharedAsset): boolean {
  return asset.propagationStatus === 'propagated' && asset.consumingSurfaces.length > 0;
}

export function summarizePropagation(assets: SharedAsset[]): { total: number; diverged: number } {
  const diverged = assets.filter((a) => a.propagationStatus === 'diverged').length;
  return { total: assets.length, diverged };
}

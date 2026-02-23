export type ProductSurfaceName = 'api' | 'web' | 'cli';
export type ProductSurfaceStatus = 'not_started' | 'ready' | 'blocked';

export interface ProductSurface {
  surfaceId: string;
  name: ProductSurfaceName;
  status: ProductSurfaceStatus;
  lastConsistencyCheckAt?: string;
  blockingReason?: string;
}

export type SharedAssetType = 'type-contract' | 'utility-contract' | 'config-policy';
export type PropagationStatus = 'pending' | 'propagated' | 'diverged';

export interface SharedAsset {
  assetId: string;
  assetType: SharedAssetType;
  versionTag: string;
  ownerScope: string;
  propagationStatus: PropagationStatus;
  consumingSurfaces: ProductSurfaceName[];
  lastUpdatedAt: string;
}

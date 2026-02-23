import { Controller, Get, Param } from '@nestjs/common';
import type { SharedAsset } from '@knowhub/shared-types';
import { SharedAssetsService } from './shared-assets.service';

@Controller('shared-assets')
export class SharedAssetsController {
  constructor(private readonly sharedAssetsService: SharedAssetsService) {}

  @Get(':assetId/propagation-report')
  getPropagationReport(@Param('assetId') assetId: string): SharedAsset {
    return this.sharedAssetsService.getPropagationReport(assetId);
  }
}

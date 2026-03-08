import { Module } from '@nestjs/common';
import { PaginationHelper } from './pagination-helper.service';
import { TitleGeneratorService } from './title-generator.service';

@Module({
  providers: [PaginationHelper, TitleGeneratorService],
  exports: [PaginationHelper, TitleGeneratorService],
})
export class SharedModule {}

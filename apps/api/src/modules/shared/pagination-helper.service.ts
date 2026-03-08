import { Injectable } from '@nestjs/common';
import type { PaginationMeta } from '@knowhub/shared-types';

@Injectable()
export class PaginationHelper {
  paginate(page: number, limit: number, total: number): PaginationMeta {
    return {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }
}

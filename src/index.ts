import { preparePaginationResolver } from './pagination';
import { composeWithPagination } from './composeWithPagination';

export { composeWithPagination, preparePaginationResolver };

export type {
  ComposeWithPaginationOpts,
  PaginationTArgs,
  PaginationType,
  PaginationInfoType,
} from './pagination';

import { preparePaginationResolver } from './pagination';
import { composeWithPagination } from './composeWithPagination';

export { composeWithPagination, preparePaginationResolver };

export type {
  PaginationResolverOpts,
  PaginationTArgs,
  PaginationType,
  PaginationInfoType,
} from './pagination';

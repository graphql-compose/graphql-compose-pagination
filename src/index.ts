import { composeWithPagination } from './composeWithPagination';
import { preparePaginationResolver } from './paginationResolver';

export default composeWithPagination;

export { composeWithPagination, preparePaginationResolver };

export type {
  ComposeWithPaginationOpts,
  PaginationResolveParams,
  PaginationType,
  PaginationInfoType,
} from './paginationResolver';

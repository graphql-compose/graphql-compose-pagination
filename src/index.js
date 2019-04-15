/* @flow */

import { composeWithPagination } from './composeWithPagination';
import { preparePaginationResolver } from './paginationResolver';
import { preparePaginationInfoTC, preparePaginationTC } from './types/preparePaginationType';

export default composeWithPagination;

export { composeWithPagination, preparePaginationResolver, preparePaginationInfoTC, preparePaginationTC };

export type { ComposeWithPaginationOpts } from './paginationResolver';

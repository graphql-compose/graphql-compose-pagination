/* @flow */

import { TypeComposer } from 'graphql-compose';
import { preparePaginationResolver } from './paginationResolver';

export type ComposeWithPaginationOpts = {
  findResolverName: string,
  countResolverName: string,
  perPage?: number,
};

export function composeWithPagination(
  typeComposer: TypeComposer,
  opts: ComposeWithPaginationOpts
): TypeComposer {
  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('You should provide TypeComposer instance to composeWithPagination method');
  }

  if (!opts) {
    throw new Error('You should provide non-empty options to composeWithPagination');
  }

  if (typeComposer.hasResolver('pagination')) {
    return typeComposer;
  }

  const resolver = preparePaginationResolver(typeComposer, opts);

  typeComposer.setResolver('pagination', resolver);
  return typeComposer;
}

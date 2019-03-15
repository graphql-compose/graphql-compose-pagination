/* @flow */

import { TypeComposer } from 'graphql-compose';
import {
  preparePaginationResolver,
  type ComposeWithPaginationOpts,
  DEFAULT_RESOLVER_NAME,
} from './paginationResolver';

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

  const resolverName = opts.paginationResolverName || DEFAULT_RESOLVER_NAME;

  if (typeComposer.hasResolver(resolverName)) {
    return typeComposer;
  }

  const resolver = preparePaginationResolver(typeComposer, opts);

  typeComposer.setResolver(resolverName, resolver);
  return typeComposer;
}

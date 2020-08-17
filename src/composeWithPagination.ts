import { ObjectTypeComposer } from 'graphql-compose';
import {
  preparePaginationResolver,
  ComposeWithPaginationOpts,
  DEFAULT_RESOLVER_NAME,
} from './paginationResolver';

export function composeWithPagination<TSource, TContext>(
  typeComposer: ObjectTypeComposer<TSource, TContext>,
  opts: ComposeWithPaginationOpts
): ObjectTypeComposer<TSource, TContext> {
  if (!typeComposer || typeComposer.constructor.name !== 'ObjectTypeComposer') {
    throw new Error(
      'You should provide ObjectTypeComposer instance to composeWithPagination method'
    );
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

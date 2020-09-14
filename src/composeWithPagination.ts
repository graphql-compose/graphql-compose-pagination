import { ObjectTypeComposer } from 'graphql-compose';
import {
  preparePaginationResolver,
  PaginationResolverOpts,
  DEFAULT_RESOLVER_NAME,
} from './pagination';

/**
 * @deprecated use `preparePaginationResolver()` instead
 */
export function composeWithPagination<TSource, TContext>(
  typeComposer: ObjectTypeComposer<TSource, TContext>,
  opts: PaginationResolverOpts
): ObjectTypeComposer<TSource, TContext> {
  if (!typeComposer || typeComposer.constructor.name !== 'ObjectTypeComposer') {
    throw new Error(
      'You should provide ObjectTypeComposer instance to composeWithPagination method'
    );
  }

  if (!opts) {
    throw new Error('You should provide non-empty options to composeWithPagination');
  }

  const resolverName = opts.name || DEFAULT_RESOLVER_NAME;
  if (typeComposer.hasResolver(resolverName)) {
    return typeComposer;
  }
  const resolver = preparePaginationResolver(typeComposer, opts);
  typeComposer.setResolver(resolverName, resolver);

  return typeComposer;
}

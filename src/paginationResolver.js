/* @flow */
/* eslint-disable no-param-reassign, no-use-before-define */

import { Resolver, TypeComposer } from 'graphql-compose';
import type { ResolveParams, ProjectionType } from 'graphql-compose';
import type { GraphQLResolveInfo } from 'graphql-compose/lib/graphql';
import type { ComposeWithPaginationOpts } from './composeWithPagination';
import preparePaginationType from './types/paginationType';

const DEFAULT_PER_PAGE = 20;

export type PaginationResolveParams<TSource, TContext> = {
  source: TSource,
  args: {
    page?: ?number,
    perPage?: ?number,
    sort?: any,
    filter?: { [fieldName: string]: any },
    [argName: string]: any,
  },
  context: TContext,
  info: GraphQLResolveInfo,
  projection: $Shape<ProjectionType>,
  [opt: string]: any,
};

export type PaginationType = {|
  count: number,
  items: any[],
  pageInfo: PaginationInfoType,
|};

export type PaginationInfoType = {|
  currentPage: number,
  perPage: number,
  itemCount: number,
  pageCount: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
|};

export function preparePaginationResolver<TSource, TContext>(
  typeComposer: TypeComposer,
  opts: ComposeWithPaginationOpts
): Resolver<TSource, TContext> {
  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('First arg for prepareConnectionResolver() should be instance of TypeComposer');
  }

  if (!opts.countResolverName) {
    throw new Error(
      `TypeComposer(${typeComposer.getTypeName()}) provided to composeWithConnection ` +
        'should have option `opts.countResolverName`.'
    );
  }
  const countResolver = typeComposer.getResolver(opts.countResolverName);
  if (!countResolver) {
    throw new Error(
      `TypeComposer(${typeComposer.getTypeName()}) provided to composeWithConnection ` +
        `should have resolver with name '${opts.countResolverName}' ` +
        'due opts.countResolverName.'
    );
  }
  const countResolve = countResolver.getResolve();

  if (!opts.findResolverName) {
    throw new Error(
      `TypeComposer(${typeComposer.getTypeName()}) provided to composeWithConnection ` +
        'should have option `opts.findResolverName`.'
    );
  }
  const findManyResolver = typeComposer.getResolver(opts.findResolverName);
  if (!findManyResolver) {
    throw new Error(
      `TypeComposer(${typeComposer.getTypeName()}) provided to composeWithConnection ` +
        `should have resolver with name '${opts.findResolverName}' ` +
        'due opts.countResolverName.'
    );
  }
  const findManyResolve = findManyResolver.getResolve();

  const additionalArgs = {};
  if (findManyResolver.hasArg('filter')) {
    const filter = findManyResolver.getArg('filter');
    if (filter) {
      additionalArgs.filter = filter;
    }
  }
  if (findManyResolver.hasArg('sort')) {
    const sort = findManyResolver.getArg('sort');
    if (sort) {
      additionalArgs.sort = sort;
    }
  }

  return new Resolver({
    type: preparePaginationType(typeComposer),
    name: 'pagination',
    kind: 'query',
    args: {
      page: {
        type: 'Int',
        description: 'Page number for displaying',
      },
      perPage: {
        type: 'Int',
        description: '',
        defaultValue: opts.perPage || DEFAULT_PER_PAGE,
      },
      ...(additionalArgs: any),
    },
    // eslint-disable-next-line
    resolve: async (resolveParams: $Shape<PaginationResolveParams<TSource, TContext>>) => {
      let countPromise;
      let findManyPromise;
      const { projection = {}, args, rawQuery } = resolveParams;
      const findManyParams: $Shape<ResolveParams<TSource, TContext>> = {
        ...resolveParams,
      };

      const page = parseInt(args.page, 10) || 1;
      if (page <= 0) {
        throw new Error('Argument `page` should be positive number.');
      }
      const perPage = parseInt(args.perPage, 10) || opts.perPage || DEFAULT_PER_PAGE;
      if (perPage <= 0) {
        throw new Error('Argument `perPage` should be positive number.');
      }

      const countParams: $Shape<ResolveParams<TSource, TContext>> = {
        ...resolveParams,
        rawQuery,
        args: {
          filter: { ...resolveParams.args.filter },
        },
      };

      if (
        projection.count ||
        (projection.pageInfo && (projection.pageInfo.itemCount || projection.pageInfo.pageCount))
      ) {
        countPromise = countResolve(countParams);
      } else {
        countPromise = Promise.resolve(0);
      }

      if (projection && projection.items) {
        // combine top level projection
        // (maybe somebody add additional fields via resolveParams.projection)
        // and items (record needed fields)
        findManyParams.projection = { ...projection, ...projection.items };
      } else {
        findManyParams.projection = { ...projection };
      }

      const limit = perPage;
      const skip = (page - 1) * perPage;

      findManyParams.args.limit = limit + 1; // +1 document, to check next page presence
      if (skip > 0) {
        findManyParams.args.skip = skip;
      }

      // pass findMany ResolveParams to top resolver
      resolveParams.findManyResolveParams = findManyParams;
      resolveParams.countResolveParams = countParams;

      // This allows to optimize and not actually call the findMany resolver
      // if only the count is projected
      if ((projection.count || projection.pageInfo) && Object.keys(projection).length === 1) {
        findManyPromise = Promise.resolve([]);
      } else {
        findManyPromise = findManyResolve(findManyParams);
      }

      return Promise.all([findManyPromise, countPromise]).then(([items, count]) => {
        const result: PaginationType = {
          count,
          items: items.length > limit ? items.slice(0, limit) : items,
          pageInfo: {
            currentPage: page,
            perPage,
            itemCount: count,
            pageCount: Math.ceil(count / perPage),
            hasPreviousPage: page > 1,
            hasNextPage: items.length > limit || page * perPage < count,
          },
        };
        return result;
      });
    },
  });
}

import { Resolver, inspect } from 'graphql-compose';
import type {
  ObjectTypeComposer,
  ResolverResolveParams,
  ObjectTypeComposerArgumentConfigMap,
} from 'graphql-compose';
import { preparePaginationTC } from './types';

export const DEFAULT_RESOLVER_NAME = 'pagination';
export const DEFAULT_PER_PAGE = 20;

export type PaginationResolverOpts = {
  findManyResolver: Resolver;
  countResolver: Resolver;
  name?: string;
  perPage?: number;
};

export type PaginationType = {
  count: number;
  items: any[];
  pageInfo: PaginationInfoType;
};

export type PaginationInfoType = {
  currentPage: number;
  perPage: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export interface PaginationTArgs {
  page?: number;
  perPage?: number;
  filter?: any;
  sort?: any;
}

export function preparePaginationResolver<TSource, TContext>(
  tc: ObjectTypeComposer<TSource, TContext>,
  opts: PaginationResolverOpts
): Resolver<TSource, TContext, PaginationTArgs> {
  if (!tc || tc.constructor.name !== 'ObjectTypeComposer') {
    throw new Error(
      'First arg for prepareConnectionResolver() should be instance of ObjectTypeComposer'
    );
  }

  const resolverName = opts.name || DEFAULT_RESOLVER_NAME;

  if (!opts.countResolver || !(opts.countResolver instanceof Resolver)) {
    throw new Error(
      `Option 'opts.countResolver' must be a Resolver instance. Received ${inspect(
        opts.countResolver
      )}`
    );
  }

  const countResolve = opts.countResolver.getResolve();

  if (!opts.findManyResolver || !(opts.findManyResolver instanceof Resolver)) {
    throw new Error(
      `Option 'opts.findManyResolver' must be a Resolver instance. Received ${inspect(
        opts.findManyResolver
      )}`
    );
  }
  const findManyResolver = opts.findManyResolver;
  const findManyResolve = findManyResolver.getResolve();

  const additionalArgs: ObjectTypeComposerArgumentConfigMap = {};
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

  return tc.schemaComposer.createResolver({
    type: preparePaginationTC(tc, resolverName),
    name: resolverName,
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
      ...additionalArgs,
    },
    resolve: async (rp: ResolverResolveParams<TSource, TContext, PaginationTArgs>) => {
      let countPromise;
      let findManyPromise;
      const { projection = {}, args, rawQuery } = rp;

      const page = parseInt(args.page as any, 10) || 1;
      if (page <= 0) {
        throw new Error('Argument `page` should be positive number.');
      }
      const perPage = parseInt(args.perPage as any, 10) || opts.perPage || DEFAULT_PER_PAGE;
      if (perPage <= 0) {
        throw new Error('Argument `perPage` should be positive number.');
      }

      const countParams: ResolverResolveParams<TSource, TContext, any> = {
        ...rp,
        rawQuery,
        args: {
          ...rp.args,
          filter: { ...rp.args.filter },
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

      const findManyParams: ResolverResolveParams<TSource, TContext, any> = {
        ...rp,
      };

      if (projection && projection.items) {
        // combine top level projection
        // (maybe somebody add additional fields via rp.projection)
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
      rp.findManyResolveParams = findManyParams;
      rp.countResolveParams = countParams;

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

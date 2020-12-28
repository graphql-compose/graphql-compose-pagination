import { Resolver, ResolverResolveParams } from 'graphql-compose';
import { GraphQLInt } from 'graphql-compose/lib/graphql';
import { UserTC, countResolver, findManyResolver } from '../__mocks__/User';
import { preparePaginationResolver } from '../pagination';

describe('preparePaginationResolver()', () => {
  const spyFindManyResolve = jest.spyOn(findManyResolver, 'resolve');
  const spyCountResolve = jest.spyOn(countResolver, 'resolve');
  const paginationResolver = preparePaginationResolver(UserTC, {
    countResolver,
    findManyResolver,
    perPage: 5,
  });

  describe('definition checks', () => {
    it('should return Resolver', () => {
      expect(paginationResolver).toBeInstanceOf(Resolver);
    });

    it('should throw error if first arg is not ObjectTypeComposer', () => {
      expect(() => {
        const wrongArgs = [123];
        // @ts-expect-error
        preparePaginationResolver(...wrongArgs);
      }).toThrowError('should be instance of ObjectTypeComposer');
    });

    it('should throw error if opts.countResolverName are empty or wrong', () => {
      expect(() => {
        const wrongArgs = [UserTC, {}];
        // @ts-expect-error
        preparePaginationResolver(...wrongArgs);
      }).toThrowError("'opts.countResolver' must be a Resolver instance");

      expect(() =>
        preparePaginationResolver(UserTC, {
          // @ts-expect-error
          countResolver: 'countDoesNotExists',
          findManyResolver,
        })
      ).toThrowError("'opts.countResolver' must be a Resolver instance");
    });

    it('should throw error if opts.findManyResolver are empty or wrong', () => {
      expect(() => {
        const wrongArgs = [UserTC, { countResolverName: 'count' }];
        // @ts-expect-error
        preparePaginationResolver(...wrongArgs);
      }).toThrowError("'opts.countResolver' must be a Resolver instance");

      expect(() =>
        preparePaginationResolver(UserTC, {
          countResolver,
          // @ts-expect-error
          findManyResolver: 'findManyDoesNotExists',
        })
      ).toThrowError("'opts.findManyResolver' must be a Resolver instance");
    });

    it('should return a separate resolver with different type', () => {
      const anotherPaginationResolver = preparePaginationResolver(UserTC, {
        countResolver,
        findManyResolver,
        name: 'otherPagination'
      });
      expect(anotherPaginationResolver.getTypeName()).toBe('UserOtherPagination');
    })
  });

  describe('resolver basic properties', () => {
    it('should have name `pagination`', () => {
      expect(paginationResolver.name).toBe('pagination');
    });

    it('should have kind `query`', () => {
      expect(paginationResolver.kind).toBe('query');
    });

    it('should have type to be ConnectionType', () => {
      expect(paginationResolver.getTypeName()).toBe('UserPagination');
    });
  });

  describe('resolver args', () => {
    it('should have `page` arg', () => {
      expect(paginationResolver.getArgType('page')).toBe(GraphQLInt);
    });

    it('should have `perPage` arg', () => {
      expect(paginationResolver.getArgType('perPage')).toBe(GraphQLInt);
    });
  });

  describe('call of resolvers', () => {
    let spyResolveParams: ResolverResolveParams<any, any>;
    let mockedPaginationResolver: Resolver;
    let findManyResolverCalled: boolean;
    let countResolverCalled: boolean;

    beforeEach(() => {
      findManyResolverCalled = false;
      countResolverCalled = false;
      const mockedFindMany = findManyResolver.wrapResolve((next) => (resolveParams) => {
        findManyResolverCalled = true;
        spyResolveParams = resolveParams;
        return next(resolveParams);
      });
      const mockedCount = countResolver.wrapResolve((next) => (resolveParams) => {
        countResolverCalled = true;
        spyResolveParams = resolveParams;
        return next(resolveParams);
      });
      mockedPaginationResolver = preparePaginationResolver(UserTC, {
        countResolver: mockedCount,
        findManyResolver: mockedFindMany,
      });
    });

    it('should pass to findMany args.sort', async () => {
      await mockedPaginationResolver.resolve({
        args: {
          sort: { name: 1 },
          first: 3,
        },
        projection: {
          items: true,
        },
      });
      expect(spyResolveParams.args.sort.name).toBe(1);
    });

    it('should pass to findMany projection from `items` on top level', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          items: {
            name: true,
            age: true,
          },
        },
      });
      expect(spyResolveParams.projection.name).toBe(true);
      expect(spyResolveParams.projection.age).toBe(true);
    });

    it('should pass to findMany custom projections to top level', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          items: true,
          score: { $meta: 'textScore' },
        },
      });
      expect(spyResolveParams.projection.score).toEqual({ $meta: 'textScore' });
    });

    it('should call count but not findMany when only count is projected', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          count: true,
        },
      });
      expect(countResolverCalled).toBe(true);
      expect(findManyResolverCalled).toBe(false);
    });

    it('should call count but not findMany when only pageInfo.itemCount is projected', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          pageInfo: {
            itemCount: true,
          },
        },
      });
      expect(countResolverCalled).toBe(true);
      expect(findManyResolverCalled).toBe(false);
    });

    it('should call count but not findMany when only pageInfo.pageCount is projected', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          pageInfo: {
            itemCount: true,
          },
        },
      });
      expect(countResolverCalled).toBe(true);
      expect(findManyResolverCalled).toBe(false);
    });

    it('should call count and findMany resolver when count and items is projected', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          count: true,
          items: {
            name: true,
            age: true,
          },
        },
      });
      expect(countResolverCalled).toBe(true);
      expect(findManyResolverCalled).toBe(true);
    });

    it('should call findMany and not count when arbitrary top level fields are projected without count', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          name: true,
          age: true,
        },
      });
      expect(countResolverCalled).toBe(false);
      expect(findManyResolverCalled).toBe(true);
    });

    it('should call findMany and count when arbitrary top level fields are projected with count', async () => {
      await mockedPaginationResolver.resolve({
        args: {},
        projection: {
          count: true,
          name: true,
          age: true,
        },
      });
      expect(countResolverCalled).toBe(true);
      expect(findManyResolverCalled).toBe(true);
    });

    it('should call findMany but not count resolver when first arg is used', async () => {
      await mockedPaginationResolver.resolve({
        args: { first: 1 },
        projection: {
          edges: {
            node: {
              name: true,
              age: true,
            },
          },
        },
      });
      expect(countResolverCalled).toBe(false);
      expect(findManyResolverCalled).toBe(true);
    });
  });

  describe('filter tests with resolve', () => {
    it('should pass `filter` arg to `findMany` and `count` resolvers', async () => {
      spyFindManyResolve.mockClear();
      spyCountResolve.mockClear();
      await paginationResolver.resolve({
        args: {
          filter: {
            gender: 'm',
          },
        },
        projection: {
          count: true,
          items: {
            name: true,
          },
        },
      });
      expect(spyFindManyResolve.mock.calls).toEqual([
        [
          {
            args: { filter: { gender: 'm' }, limit: 6 },
            projection: { count: true, items: { name: true }, name: true },
          },
        ],
      ]);
      expect(spyCountResolve.mock.calls).toEqual([
        [
          {
            args: { filter: { gender: 'm' } },
            projection: { count: true, items: { name: true } },
            rawQuery: undefined,
          },
        ],
      ]);
    });

    it('should add additional filtering', async () => {
      const result = await paginationResolver.resolve({
        args: {
          filter: {
            gender: 'm',
          },
          sort: { id: 1 },
        },
        projection: {
          count: true,
          items: {
            name: true,
          },
        },
      });
      expect(result.items).toHaveLength(5);
      expect(result.items[0]).toEqual({
        id: 1,
        name: 'user01',
        age: 11,
        gender: 'm',
      });
      expect(result.items[4]).toEqual({
        id: 9,
        name: 'user09',
        age: 19,
        gender: 'm',
      });
      expect(result.count).toBe(8);
    });
  });

  describe('sort tests with resolve', () => {
    it('should pass `sort` arg to `findMany` but not to `count` resolvers', async () => {
      spyFindManyResolve.mockClear();
      spyCountResolve.mockClear();
      await paginationResolver.resolve({
        args: {
          sort: { _id: 1 },
        },
        projection: {
          count: true,
          items: {
            name: true,
          },
        },
      });
      expect(spyFindManyResolve.mock.calls).toEqual([
        [
          {
            args: { limit: 6, sort: { _id: 1 } },
            projection: { count: true, items: { name: true }, name: true },
          },
        ],
      ]);
      expect(spyCountResolve.mock.calls).toEqual([
        [
          {
            args: {
              filter: {},
              sort: {
                _id: 1,
              },
            },
            projection: { count: true, items: { name: true } },
            rawQuery: undefined,
          },
        ],
      ]);
    });
  });

  describe('resolver payload', () => {
    it('should have correct pageInfo for first page', async () => {
      const result = await paginationResolver.resolve({
        args: {},
        projection: {
          pageInfo: {
            currentPage: true,
            perPage: true,
            itemCount: true,
            pageCount: true,
            hasPreviousPage: true,
            hasNextPage: true,
          },
        },
      });

      expect(result.pageInfo).toEqual({
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
        itemCount: 15,
        pageCount: 3,
        perPage: 5,
      });
    });

    it('should have correct pageInfo for last page', async () => {
      const result = await paginationResolver.resolve({
        args: { page: 3 },
        projection: {
          pageInfo: {
            currentPage: true,
            perPage: true,
            itemCount: true,
            pageCount: true,
            hasPreviousPage: true,
            hasNextPage: true,
          },
        },
      });

      expect(result.pageInfo).toEqual({
        currentPage: 3,
        hasNextPage: false,
        hasPreviousPage: true,
        itemCount: 15,
        pageCount: 3,
        perPage: 5,
      });
    });
  });
});

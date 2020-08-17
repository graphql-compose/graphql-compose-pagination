import { ObjectTypeComposer, schemaComposer } from 'graphql-compose';
import { GraphQLList, graphql } from 'graphql-compose/lib/graphql';
import { composeWithPagination } from '../composeWithPagination';
import { UserTC } from '../__mocks__/User';

describe('composeWithRelay', () => {
  const userComposer = composeWithPagination(UserTC, {
    countResolverName: 'count',
    findResolverName: 'findMany',
    perPage: 5,
  });

  describe('basic checks', () => {
    it('should return ObjectTypeComposer', () => {
      expect(userComposer).toBeInstanceOf(ObjectTypeComposer);
      expect(userComposer).toBe(UserTC);
    });

    it('should throw error if first arg is not ObjectTypeComposer', () => {
      expect(() => {
        const wrongArgs = [123];
        // @ts-expect-error
        composeWithPagination(...wrongArgs);
      }).toThrowError('should provide ObjectTypeComposer instance');
    });

    it('should throw error if options are empty', () => {
      expect(() => {
        const wrongArgs = [UserTC];
        // @ts-expect-error
        composeWithPagination(...wrongArgs);
      }).toThrowError('should provide non-empty options');
    });

    it('should not change `pagination` resolver if exists', () => {
      let myTC = schemaComposer.createObjectTC('type Complex { a: String, b: Int }');
      myTC.addResolver({
        name: 'pagination',
        resolve: () => 'mockData',
      });

      // try ovewrite `pagination` resolver
      myTC = composeWithPagination(myTC, {
        countResolverName: 'count',
        findResolverName: 'findMany',
      });

      expect(myTC.getResolver('pagination')).toBeTruthy();
      expect(myTC.getResolver('pagination').resolve({})).toBe('mockData');
    });

    it('should add resolver with user-specified name', () => {
      let myTC = schemaComposer.createObjectTC('type CustomComplex { a: String, b: Int }');
      myTC.addResolver({
        name: 'count',
        resolve: () => 1,
      });
      myTC.addResolver({
        name: 'findMany',
        resolve: () => ['mockData'],
      });
      myTC = composeWithPagination(myTC, {
        paginationResolverName: 'customPagination',
        countResolverName: 'count',
        findResolverName: 'findMany',
      });

      expect(myTC.getResolver('customPagination')).toBeTruthy();
      expect(myTC.hasResolver('pagination')).toBeFalsy();
    });

    it('should add two connection resolvers', () => {
      let myTC = schemaComposer.createObjectTC('type CustomComplex { a: String, b: Int }');
      myTC.addResolver({
        name: 'count',
        resolve: () => 1,
      });
      myTC.addResolver({
        name: 'findMany',
        resolve: () => ['mockData'],
      });
      myTC = composeWithPagination(myTC, {
        countResolverName: 'count',
        findResolverName: 'findMany',
      });
      myTC = composeWithPagination(myTC, {
        paginationResolverName: 'customPagination',
        countResolverName: 'count',
        findResolverName: 'findMany',
      });

      expect(myTC.hasResolver('pagination')).toBeTruthy();
      expect(myTC.getResolver('customPagination')).toBeTruthy();
    });
  });

  describe('check `pagination` resolver props', () => {
    const rsv = userComposer.getResolver('pagination');
    const type: any = rsv.getType();
    const tc = schemaComposer.createObjectTC(type);

    it('should exists', () => {
      expect(rsv).toBeTruthy();
    });

    it('should has PaginationType as type', () => {
      expect(type).toBeTruthy();
      expect(tc.getFieldNames()).toEqual(expect.arrayContaining(['count', 'pageInfo', 'items']));
      expect(tc.getFieldType('items')).toBeInstanceOf(GraphQLList);
    });
  });

  describe('fragments fields projection of graphql-compose', () => {
    it('should return object', async () => {
      schemaComposer.Query.setField('userPagination', UserTC.getResolver('pagination'));
      const schema = schemaComposer.buildSchema();
      const query = `{
        userPagination(page: 1, perPage: 2, sort: ID_ASC) {
          count,
          pageInfo {
            currentPage
            perPage
            itemCount
            pageCount
            ...on PaginationInfo {
              hasPreviousPage
              hasNextPage
            }
          }
          items {
            id
            name
            ...idNameAge
            ...on User {
              age
            }
          }
        }
      }
      fragment idNameAge on User {
        gender
      }
      `;
      const result = await graphql(schema, query);
      expect(result).toEqual({
        data: {
          userPagination: {
            count: 15,
            items: [
              { age: 11, gender: 'm', id: 1, name: 'user01' },
              { age: 12, gender: 'm', id: 2, name: 'user02' },
            ],
            pageInfo: {
              currentPage: 1,
              hasNextPage: true,
              hasPreviousPage: false,
              itemCount: 15,
              pageCount: 8,
              perPage: 2,
            },
          },
        },
      });
    });
  });

  it('should pass `countResolveParams` to top resolverParams', async () => {
    // first build
    let topResolveParams: any = {};
    schemaComposer.Query.setField(
      'userPagination',
      UserTC.getResolver('pagination').wrapResolve((next) => (rp) => {
        const result = next(rp);
        topResolveParams = rp;
        return result;
      })
    );
    const schema = schemaComposer.buildSchema();
    const query = `{
      userPagination(filter: { age: 45 }) {
        count
      }
    }`;
    const res = await graphql(schema, query);
    expect(res).toEqual({ data: { userPagination: { count: 15 } } });
    expect(Object.keys(topResolveParams.countResolveParams)).toEqual(
      expect.arrayContaining(['source', 'args', 'context', 'info', 'projection'])
    );
    expect(topResolveParams.countResolveParams.args).toEqual({
      filter: { age: 45 },
      perPage: 5,
    });

    // second build
    let topResolveParams2: any = {};
    schemaComposer.Query.setField(
      'userPagination',
      UserTC.getResolver('pagination').wrapResolve((next) => (rp) => {
        const result = next(rp);
        topResolveParams2 = rp;
        return result;
      })
    );

    const schema2 = schemaComposer.buildSchema();
    const query2 = `{
      userPagination(filter: { age: 333 }) {
        count
      }
    }`;
    const res2 = await graphql(schema2, query2);
    expect(res2).toEqual({ data: { userPagination: { count: 15 } } });
    expect(Object.keys(topResolveParams2.countResolveParams)).toEqual(
      expect.arrayContaining(['source', 'args', 'context', 'info', 'projection'])
    );
    expect(topResolveParams2.countResolveParams.args).toEqual({
      filter: { age: 333 },
      perPage: 5,
    });
  });

  it('should pass `findManyResolveParams` to top resolverParams', async () => {
    let topResolveParams: any = {};

    schemaComposer.Query.setField(
      'userPagination',
      UserTC.getResolver('pagination').wrapResolve((next) => (rp) => {
        const result = next(rp);
        topResolveParams = rp;
        return result;
      })
    );
    const schema = schemaComposer.buildSchema();
    const query = `{
      userPagination(filter: { age: 55 }) {
        count
      }
    }`;
    const res = await graphql(schema, query);
    expect(res).toEqual({ data: { userPagination: { count: 15 } } });

    expect(Object.keys(topResolveParams.findManyResolveParams)).toEqual(
      expect.arrayContaining(['source', 'args', 'context', 'info', 'projection'])
    );

    expect(topResolveParams.findManyResolveParams.args).toEqual({
      filter: { age: 55 },
      limit: 6,
      perPage: 5,
    });
  });
});

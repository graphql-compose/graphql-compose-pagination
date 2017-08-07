/* @flow */
/* eslint-disable no-param-reassign */

import { TypeComposer, graphql } from 'graphql-compose';
import { composeWithPagination } from '../composeWithPagination';
import { userTypeComposer } from '../__mocks__/userTypeComposer';
import { rootQueryTypeComposer as rootQueryTC } from '../__mocks__/rootQueryTypeComposer';

const { GraphQLSchema, GraphQLList } = graphql;

describe('composeWithRelay', () => {
  const userComposer = composeWithPagination(userTypeComposer, {
    countResolverName: 'count',
    findResolverName: 'findMany',
    perPage: 5,
  });

  describe('basic checks', () => {
    it('should return TypeComposer', () => {
      expect(userComposer).toBeInstanceOf(TypeComposer);
    });

    it('should throw error if first arg is not TypeComposer', () => {
      // $FlowFixMe
      expect(() => composeWithPagination(123)).toThrowError('should provide TypeComposer instance');
    });

    it('should throw error if options are empty', () => {
      // $FlowFixMe
      expect(() => composeWithPagination(userTypeComposer)).toThrowError(
        'should provide non-empty options'
      );
    });

    it('should not change `pagination` resolver if exists', () => {
      let myTC = TypeComposer.create('type Complex { a: String, b: Int }');
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
      expect(myTC.getResolver('pagination').resolve()).toBe('mockData');
    });
  });

  describe('check `pagination` resolver props', () => {
    const rsv = userComposer.getResolver('pagination');
    const type = rsv.getType();
    // $FlowFixMe
    const tc = new TypeComposer(type);

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
      rootQueryTC.setField('userPagination', userTypeComposer.getResolver('pagination'));
      const schema = new GraphQLSchema({
        query: rootQueryTC.getType(),
      });
      const query = `{
        userPagination(page: 1, perPage: 2) {
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
      const result = await graphql.graphql(schema, query);
      expect(result).toEqual({
        data: {
          userPagination: {
            count: 15,
            items: [
              { age: 18, gender: 'm', id: 8, name: 'user08' },
              { age: 11, gender: 'm', id: 1, name: 'user01' },
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
    let topResolveParams;

    rootQueryTC.setField(
      'userPagination',
      userTypeComposer.getResolver('pagination').wrapResolve(next => rp => {
        const result = next(rp);
        topResolveParams = rp;
        return result;
      })
    );
    const schema = new GraphQLSchema({
      query: rootQueryTC.getType(),
    });
    const query = `{
      userPagination(filter: { age: 45 }) {
        count
      }
    }`;
    await graphql.graphql(schema, query);
    // $FlowFixMe
    expect(Object.keys(topResolveParams.countResolveParams)).toEqual(
      expect.arrayContaining(['source', 'args', 'context', 'info', 'projection'])
    );
    // $FlowFixMe
    expect(topResolveParams.countResolveParams.args).toEqual({
      filter: { age: 45 },
    });
  });

  it('should pass `findManyResolveParams` to top resolverParams', async () => {
    let topResolveParams;

    rootQueryTC.setField(
      'userPagination',
      userTypeComposer.getResolver('pagination').wrapResolve(next => rp => {
        const result = next(rp);
        topResolveParams = rp;
        return result;
      })
    );
    const schema = new GraphQLSchema({
      query: rootQueryTC.getType(),
    });
    const query = `{
      userPagination(filter: { age: 45 }) {
        count
      }
    }`;
    await graphql.graphql(schema, query);
    // $FlowFixMe
    expect(Object.keys(topResolveParams.findManyResolveParams)).toEqual(
      expect.arrayContaining(['source', 'args', 'context', 'info', 'projection'])
    );
    // $FlowFixMe
    expect(topResolveParams.findManyResolveParams.args).toEqual({
      filter: { age: 45 },
      limit: 6,
      perPage: 5,
    });
  });
});

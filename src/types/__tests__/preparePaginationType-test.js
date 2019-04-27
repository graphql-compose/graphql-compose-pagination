/* @flow */

import { ObjectTypeComposer } from 'graphql-compose';
import { GraphQLNonNull, getNamedType, GraphQLInt, GraphQLList } from 'graphql-compose/lib/graphql';
import { UserTC } from '../../__mocks__/User';
import { preparePaginationTC, preparePaginationInfoTC } from '../preparePaginationType';

describe('preparePaginationTC()', () => {
  it('should return ObjectTypeComposer', () => {
    expect(preparePaginationTC(UserTC)).toBeInstanceOf(ObjectTypeComposer);
  });

  it('should return the same Type object when called again', () => {
    const firstPaginationType = preparePaginationTC(UserTC);
    const secondPaginationType = preparePaginationTC(UserTC);
    expect(firstPaginationType).toBe(secondPaginationType);
  });

  it('should return a separate GraphQLObjectType with a different name', () => {
    const paginationType = preparePaginationTC(UserTC);
    const otherPaginationType = preparePaginationTC(UserTC, 'otherPagination');
    expect(paginationType).not.toBe(otherPaginationType);
  });

  it('should have name ending with `Pagination`', () => {
    expect(preparePaginationTC(UserTC).getTypeName()).toBe('UserPagination');
  });

  it('should have name ending with `OtherPagination` when passed lowercase otherPagination', () => {
    expect(preparePaginationTC(UserTC, 'otherConnection').getTypeName()).toBe(
      'UserOtherConnection'
    );
  });

  it('should have field `count` with provided Type', () => {
    const tc = preparePaginationTC(UserTC);
    expect(tc.getFieldType('count')).toBe(GraphQLInt);
  });

  it('should have field `pageInfo` with GraphQLNonNull(PaginationInfoType)', () => {
    const PaginationInfoTC = preparePaginationInfoTC(UserTC.schemaComposer);
    const tc = preparePaginationTC(UserTC);
    expect(tc.getFieldType('pageInfo')).toBeInstanceOf(GraphQLNonNull);

    const pageInfo = getNamedType(tc.getFieldType('pageInfo'));
    expect(pageInfo).toBe(PaginationInfoTC.getType());
  });

  it('should have field `items` with GraphQLList(EdgeType)', () => {
    const tc = preparePaginationTC(UserTC);
    expect(tc.getFieldType('items')).toBeInstanceOf(GraphQLList);

    const items: any = getNamedType(tc.getFieldType('items'));
    expect(items.name).toEqual('User');
  });

  it('should return same type for same Type in ObjectTypeComposer', () => {
    const t1 = preparePaginationTC(UserTC);
    const t2 = preparePaginationTC(UserTC);
    expect(t1).toEqual(t2);
  });
});

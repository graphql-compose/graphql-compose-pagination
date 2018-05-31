/* @flow */

import { TypeComposer } from 'graphql-compose';
import { GraphQLNonNull, getNamedType, GraphQLInt, GraphQLList } from 'graphql-compose/lib/graphql';
import { UserTC } from '../../__mocks__/User';
import { preparePaginationTC, preparePaginationInfoTC } from '../preparePaginationType';

describe('preparePaginationTC()', () => {
  it('should return TypeComposer', () => {
    expect(preparePaginationTC(UserTC)).toBeInstanceOf(TypeComposer);
  });

  it('should have name ending with `Pagination`', () => {
    expect(preparePaginationTC(UserTC).getTypeName()).toBe('UserPagination');
  });

  it('should have field `count` with provided Type', () => {
    const tc = preparePaginationTC(UserTC);
    expect(tc.getFieldType('count')).toBe(GraphQLInt);
  });

  it('should have field `pageInfo` with GraphQLNonNull(PaginationInfoType)', () => {
    const PaginationInfoTC = preparePaginationInfoTC(UserTC.constructor.schemaComposer);
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

  it('should have `ofType` property (like GraphQLList, GraphQLNonNull)', () => {
    // this behavior needed for `graphql-compose` module in `projection` helper
    // otherwise it incorrectly construct projectionMapper for tricky fields
    const connectionType: any = preparePaginationTC(UserTC).getType();
    expect(connectionType.ofType).toEqual(UserTC.getType());
  });

  it('should return same type for same Type in TypeComposer', () => {
    const t1 = preparePaginationTC(UserTC);
    const t2 = preparePaginationTC(UserTC);
    expect(t1).toEqual(t2);
  });
});

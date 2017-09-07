/* @flow */

import { TypeComposer } from 'graphql-compose';
import {
  GraphQLNonNull,
  GraphQLObjectType,
  getNamedType,
  GraphQLInt,
  GraphQLList,
} from 'graphql-compose/lib/graphql';
import { userTypeComposer } from '../../__mocks__/userTypeComposer';
import preparePaginationType from '../paginationType';
import PaginationInfoType from '../paginationInfoType';

describe('types/paginationType.js', () => {
  describe('preparePaginationType()', () => {
    it('should return GraphQLObjectType', () => {
      expect(preparePaginationType(userTypeComposer)).toBeInstanceOf(GraphQLObjectType);
    });

    it('should have name ending with `Pagination`', () => {
      expect(preparePaginationType(userTypeComposer).name).toBe('UserPagination');
    });

    it('should have field `count` with provided Type', () => {
      const tc = new TypeComposer(preparePaginationType(userTypeComposer));
      expect(tc.getFieldType('count')).toBe(GraphQLInt);
    });

    it('should have field `pageInfo` with GraphQLNonNull(PaginationInfoType)', () => {
      const tc = new TypeComposer(preparePaginationType(userTypeComposer));
      expect(tc.getFieldType('pageInfo')).toBeInstanceOf(GraphQLNonNull);

      const pageInfo = getNamedType(tc.getFieldType('pageInfo'));
      expect(pageInfo).toBe(PaginationInfoType);
    });

    it('should have field `items` with GraphQLList(EdgeType)', () => {
      const tc = new TypeComposer(preparePaginationType(userTypeComposer));
      expect(tc.getFieldType('items')).toBeInstanceOf(GraphQLList);

      const items = getNamedType(tc.getFieldType('items'));
      // $FlowFixMe
      expect(items.name).toEqual('User');
    });

    it('should have `ofType` property (like GraphQLList, GraphQLNonNull)', () => {
      // this behavior needed for `graphql-compose` module in `projection` helper
      // otherwise it incorrectly construct projectionMapper for tricky fields
      const connectionType = preparePaginationType(userTypeComposer);
      // $FlowFixMe
      expect(connectionType.ofType).toEqual(userTypeComposer.getType());
    });

    it('should return same type for same Type in TypeComposer', () => {
      const t1 = preparePaginationType(userTypeComposer);
      const t2 = preparePaginationType(userTypeComposer);
      expect(t1).toEqual(t2);
    });
  });
});

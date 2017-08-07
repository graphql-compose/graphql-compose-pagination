/* @flow */
/* eslint-disable arrow-body-style */

import { graphql } from 'graphql-compose';
import type { TypeComposer } from 'graphql-compose';
import PaginationInfoType from './paginationInfoType';

const { GraphQLInt, GraphQLObjectType, GraphQLNonNull, GraphQLList } = graphql;

const cachedPaginationTypes = new WeakMap();

export default function preparePaginationType(typeComposer: TypeComposer): GraphQLObjectType {
  const name = `${typeComposer.getTypeName()}Pagination`;
  const type = typeComposer.getType();

  if (cachedPaginationTypes.has(type)) {
    return (cachedPaginationTypes.get(type): any);
  }

  const paginationType = new GraphQLObjectType({
    name,
    description: 'List of items with pagination.',
    fields: () => ({
      count: {
        type: GraphQLInt,
        description: 'Total object count.',
      },
      items: {
        type: new GraphQLList(typeComposer.getType()),
        description: 'Array of objects.',
      },
      pageInfo: {
        type: new GraphQLNonNull(PaginationInfoType),
        description: 'Information to aid in pagination.',
      },
    }),
  });

  // This is small HACK for providing to graphql-compose/src/projection.js
  // information about required fields in projection and relations
  // $FlowFixMe
  paginationType.ofType = type;

  cachedPaginationTypes.set(type, paginationType);
  return paginationType;
}

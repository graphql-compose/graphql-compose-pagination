/* @flow */

import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql-compose/lib/graphql';

const PaginationInfoType = new GraphQLObjectType({
  name: 'PaginationInfo',
  description: 'Information about pagination.',
  fields: () => ({
    currentPage: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Current page number',
    },
    perPage: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of items per page',
    },
    pageCount: {
      type: GraphQLInt,
      description: 'Total number of pages',
    },
    itemCount: {
      type: GraphQLInt,
      description: 'Total number of items',
    },
    hasNextPage: {
      type: GraphQLBoolean,
      description: 'When paginating forwards, are there more items?',
    },
    hasPreviousPage: {
      type: GraphQLBoolean,
      description: 'When paginating backwards, are there more items?',
    },
  }),
});

export default PaginationInfoType;

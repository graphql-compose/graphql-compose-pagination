/* @flow */
/* eslint-disable arrow-body-style */

import { upperFirst, type ObjectTypeComposer, type SchemaComposer } from 'graphql-compose';

export function preparePaginationInfoTC<TContext>(
  schemaComposer: SchemaComposer<TContext>
): ObjectTypeComposer<any, TContext> {
  return schemaComposer.getOrCreateOTC('PaginationInfo', tc => {
    tc.setDescription('Information about pagination.');
    tc.addFields({
      currentPage: {
        type: 'Int!',
        description: 'Current page number',
      },
      perPage: {
        type: 'Int!',
        description: 'Number of items per page',
      },
      pageCount: {
        type: 'Int',
        description: 'Total number of pages',
      },
      itemCount: {
        type: 'Int',
        description: 'Total number of items',
      },
      hasNextPage: {
        type: 'Boolean',
        description: 'When paginating forwards, are there more items?',
      },
      hasPreviousPage: {
        type: 'Boolean',
        description: 'When paginating backwards, are there more items?',
      },
    });
  });
}

export function preparePaginationTC<TSource, TContext>(
  tc: ObjectTypeComposer<TSource, TContext>,
  resolverName: ?string
): ObjectTypeComposer<TSource, TContext> {
  const schemaComposer = tc.sc;
  const name = `${tc.getTypeName()}${upperFirst(resolverName || 'pagination')}`;
  const type = tc.getType();

  if (schemaComposer.has(name)) {
    return schemaComposer.getOTC(name);
  }

  const paginationTC = schemaComposer.createObjectTC({
    name,
    description: 'List of items with pagination.',
    fields: {
      count: {
        type: 'Int',
        description: 'Total object count.',
      },
      items: {
        type: () => [tc],
        description: 'Array of objects.',
      },
      pageInfo: {
        type: preparePaginationInfoTC(schemaComposer).getTypeNonNull(),
        description: 'Information to aid in pagination.',
      },
    },
  });

  // This is small HACK for providing to graphql-compose/src/projection.js
  // information about required fields in projection and relations
  // $FlowFixMe
  paginationTC.gqType.ofType = type;

  return paginationTC;
}

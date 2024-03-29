import {
  upperFirst,
  ObjectTypeComposer,
  SchemaComposer,
  InterfaceTypeComposer,
  UnionTypeComposer,
  ScalarTypeComposer,
  EnumTypeComposer,
} from 'graphql-compose';

// PaginationInfo should be global
const PaginationInfoTC = ObjectTypeComposer.createTemp(`
# Information about pagination.
type PaginationInfo {
  # Current page number
  currentPage: Int!
  
  # Number of items per page
  perPage: Int!
  
  # Total number of pages
  pageCount: Int
  
  # Total number of items
  itemCount: Int
  
  # When paginating forwards, are there more items?
  hasNextPage: Boolean
  
  # When paginating backwards, are there more items?
  hasPreviousPage: Boolean
}
`);

export function preparePaginationInfoTC<TContext>(
  sc: SchemaComposer<TContext>
): ObjectTypeComposer<any, TContext> {
  // Pagination Info can be overrided via SchemaComposer registry
  if (sc.has('PaginationInfo')) {
    return sc.getOTC('PaginationInfo');
  }
  sc.set('PaginationInfo', PaginationInfoTC);
  return PaginationInfoTC;
}

export function preparePaginationTC<TSource, TContext>(
  tc:
    | ObjectTypeComposer<TSource, TContext>
    | InterfaceTypeComposer<TSource, TContext>
    | UnionTypeComposer<TSource, TContext>
    | ScalarTypeComposer<TContext>
    | EnumTypeComposer<TContext>,
  resolverName?: string
): ObjectTypeComposer<TSource, TContext> {
  const schemaComposer = tc.schemaComposer;
  const name = `${tc.getTypeName()}${upperFirst(resolverName || 'pagination')}`;

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
        type: () => tc.NonNull.List,
        description: 'Array of objects.',
      },
      pageInfo: {
        type: preparePaginationInfoTC(schemaComposer).NonNull,
        description: 'Information to aid in pagination.',
      },
    },
  });

  return paginationTC;
}

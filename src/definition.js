/* @flow */
/* eslint-disable */

import type {
  ResolveParams as _ResolveParams,
  GraphQLArgumentConfig as _GraphQLArgumentConfig,
  GraphQLResolveInfo,
  ProjectionType,
} from 'graphql-compose/lib/definition.js';

export type ComposeWithPaginationOpts = {
  findResolverName: string,
  countResolverName: string,
  perPage?: number,
};

export type GraphQLArgumentConfig = _GraphQLArgumentConfig;
export type ResolveParams<TSource, TContext> = _ResolveParams<
  TSource,
  TContext
>;

export type PaginationResolveParams<TSource, TContext> = {
  source: TSource,
  args: {
    page?: ?number,
    perPage?: ?number,
    sort?: any,
    filter?: { [fieldName: string]: any },
    [argName: string]: any,
  },
  context: TContext,
  info: GraphQLResolveInfo,
  projection: $Shape<ProjectionType>,
  [opt: string]: any,
};

export type GraphQLPaginationType = {|
  count: number,
  items: any[],
  pageInfo: PaginationInfoType,
|};

export type PaginationInfoType = {|
  currentPage: number,
  perPage: number,
  itemCount: number,
  pageCount: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
|};

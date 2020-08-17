import { schemaComposer, ResolverResolveParams } from 'graphql-compose';

export const UserTC = schemaComposer.createObjectTC(`
  type User {
    id: Int
    name: String
    age: Int
    gender: String
  }
`);

export const userList = [
  { id: 1, name: 'user01', age: 11, gender: 'm' },
  { id: 2, name: 'user02', age: 12, gender: 'm' },
  { id: 3, name: 'user03', age: 13, gender: 'f' },
  { id: 4, name: 'user04', age: 14, gender: 'm' },
  { id: 5, name: 'user05', age: 15, gender: 'f' },
  { id: 6, name: 'user06', age: 16, gender: 'f' },
  { id: 7, name: 'user07', age: 17, gender: 'f' },
  { id: 8, name: 'user08', age: 18, gender: 'm' },
  { id: 9, name: 'user09', age: 19, gender: 'm' },
  { id: 10, name: 'user10', age: 49, gender: 'f' },
  { id: 11, name: 'user11', age: 49, gender: 'm' },
  { id: 12, name: 'user12', age: 47, gender: 'f' },
  { id: 15, name: 'user15', age: 45, gender: 'm' },
  { id: 14, name: 'user14', age: 45, gender: 'm' },
  { id: 13, name: 'user13', age: 45, gender: 'f' },
];

const filterArgConfig = {
  name: 'filter',
  type: `input FilterUserInput {
    gender: String
    age: Int
  }`,
};

function filteredUserList(list: typeof userList, filter = {} as any) {
  let result = list.slice();
  if (filter.gender) {
    result = result.filter((o) => o.gender === filter.gender);
  }

  if (filter.id) {
    if (filter.id.$lt) {
      result = result.filter((o) => o.id < filter.id.$lt);
    }
    if (filter.id.$gt) {
      result = result.filter((o) => o.id > filter.id.$gt);
    }
  }
  if (filter.age) {
    if (filter.age.$lt) {
      result = result.filter((o) => o.age < filter.age.$lt);
    }
    if (filter.age.$gt) {
      result = result.filter((o) => o.age > filter.age.$gt);
    }
  }

  return result;
}

function sortUserList(
  list: typeof userList,
  sortValue = {} as Record<keyof typeof userList[0], number>
) {
  const fields = Object.keys(sortValue) as Array<keyof typeof userList[0]>;
  list.sort((a, b) => {
    let result = 0;
    fields.forEach((field) => {
      if (result === 0) {
        if (a[field] < b[field]) {
          result = sortValue[field] * -1;
        } else if (a[field] > b[field]) {
          result = sortValue[field];
        }
      }
    });
    return result;
  });
  return list;
}

function prepareFilterFromArgs(resolveParams = {} as ResolverResolveParams<any, any>) {
  const args = resolveParams.args || {};
  const filter = { ...args.filter };
  if (resolveParams.rawQuery) {
    Object.keys(resolveParams.rawQuery).forEach((k) => {
      filter[k] = resolveParams.rawQuery[k];
    });
  }
  return filter;
}

export const findManyResolver = schemaComposer.createResolver({
  name: 'findMany',
  kind: 'query',
  type: UserTC,
  args: {
    filter: filterArgConfig,
    sort: schemaComposer.createEnumTC({
      name: 'SortUserInput',
      values: {
        ID_ASC: { value: { id: 1 } },
        ID_DESC: { value: { id: -1 } },
        AGE_ASC: { value: { age: 1 } },
        AGE_DESC: { value: { age: -1 } },
      },
    }),
    limit: 'Int',
    skip: 'Int',
  },
  resolve: (resolveParams) => {
    const args = resolveParams.args || {};
    const { sort, limit, skip } = args;

    let list = userList.slice();
    list = sortUserList(list, sort as any);
    list = filteredUserList(list, prepareFilterFromArgs(resolveParams));

    if (skip) {
      list = list.slice(skip as any);
    }

    if (limit) {
      list = list.slice(0, limit as any);
    }

    return Promise.resolve(list);
  },
});
UserTC.setResolver('findMany', findManyResolver);

export const countResolver = schemaComposer.createResolver({
  name: 'count',
  kind: 'query',
  type: 'Int',
  args: {
    filter: filterArgConfig,
  },
  resolve: (resolveParams) => {
    return Promise.resolve(filteredUserList(userList, prepareFilterFromArgs(resolveParams)).length);
  },
});
UserTC.setResolver('count', countResolver);

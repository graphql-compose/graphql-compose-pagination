# graphql-compose-pagination

[![travis build](https://img.shields.io/travis/graphql-compose/graphql-compose-pagination.svg)](https://travis-ci.org/graphql-compose/graphql-compose-pagination)
[![codecov coverage](https://img.shields.io/codecov/c/github/graphql-compose/graphql-compose-pagination.svg)](https://codecov.io/github/graphql-compose/graphql-compose-pagination)
[![npm](https://img.shields.io/npm/v/graphql-compose-pagination.svg)](https://www.npmjs.com/package/graphql-compose-pagination)
[![trend](https://img.shields.io/npm/dt/graphql-compose-pagination.svg)](http://www.npmtrends.com/graphql-compose-pagination)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This is a plugin for [graphql-compose](https://github.com/graphql-compose/graphql-compose) family, which adds to the ObjectTypeComposer `pagination` resolver.

Live demo: [https://graphql-compose.herokuapp.com/](https://graphql-compose.herokuapp.com/)

[CHANGELOG](https://github.com/graphql-compose/graphql-compose-pagination/blob/master/CHANGELOG.md)

## Installation

```bash
npm install graphql graphql-compose graphql-compose-pagination --save
```

Modules `graphql` and `graphql-compose` are in `peerDependencies`, so should be installed explicitly in your app. They should not installed as sub-modules, cause internally checks the classes instances.

## Example

```js
import { preparePaginationResolver } from 'graphql-compose-pagination';
import { UserTC, findManyResolver, countResolver } from './user';

const paginationResolver = preparePaginationResolver(UserTC, {
  findManyResolver,
  countResolver,
  name: 'pagination', // Default
  perPage: 20, // Default
});
```

Implementation of `findManyResolver` and `countResolver` can be found in [this file](./src/__mocks__/User.ts).

<img width="832" alt="screen shot 2017-08-07 at 23 31 46" src="https://user-images.githubusercontent.com/1946920/29038210-ad2390e4-7bc8-11e7-8143-ff0cca2b39cc.png">

## Used in plugins

[graphql-compose-mongoose](https://github.com/graphql-compose/graphql-compose-mongoose) – converts mongoose models to graphql types

## License

[MIT](https://github.com/graphql-compose/graphql-compose-pagination/blob/master/LICENSE.md)

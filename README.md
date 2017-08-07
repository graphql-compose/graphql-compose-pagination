# graphql-compose-pagination

[![travis build](https://img.shields.io/travis/nodkz/graphql-compose-pagination.svg)](https://travis-ci.org/nodkz/graphql-compose-pagination)
[![codecov coverage](https://img.shields.io/codecov/c/github/nodkz/graphql-compose-pagination.svg)](https://codecov.io/github/nodkz/graphql-compose-pagination)
[![](https://img.shields.io/npm/v/graphql-compose-pagination.svg)](https://www.npmjs.com/package/graphql-compose-pagination)
[![npm](https://img.shields.io/npm/dt/graphql-compose-pagination.svg)](http://www.npmtrends.com/graphql-compose-pagination)
[![Join the chat at https://gitter.im/graphql-compose/Lobby](https://badges.gitter.im/nodkz/graphql-compose.svg)](https://gitter.im/graphql-compose/Lobby)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Greenkeeper badge](https://badges.greenkeeper.io/nodkz/graphql-compose-pagination.svg)](https://greenkeeper.io/)

This is a plugin for [graphql-compose](https://github.com/nodkz/graphql-compose) family, which adds to the TypeComposer `pagination` resolver.

Live demo: [https://graphql-compose.herokuapp.com/](https://graphql-compose.herokuapp.com/)

[CHANGELOG](https://github.com/nodkz/graphql-compose-pagination/blob/master/CHANGELOG.md)

Installation
============
```
npm install graphql graphql-compose graphql-compose-pagination --save
```

Modules `graphql` and `graphql-compose` are in `peerDependencies`, so should be installed explicitly in your app. They should not installed as submodules, cause internally checks the classes instances.


Example
=======
```js
import composeWithPagination from 'graphql-compose-pagination';
import userTypeComposer from './user.js';

composeWithPagination(userTypeComposer, {
  findResolverName: 'findMany',
  countResolverName: 'count',
});
```

Requirements
============
Types should have following resolvers:
* `count` - for records count
* `findMany` - for filtering records. Resolver `findMany` should have `limit` and `skip` args.

Used in plugins
===============
[graphql-compose-mongoose](https://github.com/nodkz/graphql-compose-mongoose) - converts mongoose models to graphql types


License
=======
[MIT](https://github.com/nodkz/graphql-compose-pagination/blob/master/LICENSE.md)

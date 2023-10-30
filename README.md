# QueryQL

[![npm](https://img.shields.io/npm/v/@truepic/queryql?color=0f4484)](https://www.npmjs.com/package/@truepic/queryql)
![GitHub Actions](https://github.com/TRUEPIC/queryql/actions/workflows/ci.yml/badge.svg)
![piratepx](https://app.piratepx.com/ship?p=e91ddd1b-31ad-4c36-b03e-be4a1e9a7678&i=queryql)

QueryQL makes it easy to add filtering, sorting, and pagination to your Node.js
REST API through your old friend: the query string!
[Read our introductory article](https://medium.com/truepicinc/queryql-easily-add-filtering-sorting-and-pagination-to-your-node-js-rest-api-9222135c93ae)
to learn more about why we wrote it and the problems it solves at
[Truepic](https://truepic.com).

QueryQL works with any Node.js web framework (be it Express, Koa, etc.),
supports any query builder / ORM through _adapters_, and allows for custom
_validators_ so you can define validation in a familiar way.

Out of the box, QueryQL supports the following:

- Adapter: [Knex](https://knexjs.org/) (works with
  [Objection.js](https://vincit.github.io/objection.js) and other ORMs that use
  Knex)
- Validator: [Joi](https://github.com/hapijs/joi)

## Installation

```bash
npm install @truepic/queryql
```

## Getting Started

QueryQL takes a parsed query string (like Express' `req.query`) and translates
it into the appropriate function calls that your query builder / ORM understands
to filter, sort, and paginate the records.

(Make sure your framework uses a query string parser that supports nested
objects. Node.js's native
[`querystring`](https://nodejs.org/api/querystring.html) module _does not_, but
a package like [qs](https://github.com/ljharb/qs) does. It's usually a simple
config change to switch.)

Let's consider an example to illustrate:

```
/images?filter[id][in][]=2&filter[id][in][]=3&filter[status]=open&sort=name&page[size]=10
```

```js
{
  filter: {
    id: {
      in: [2, 3],
    },
    status: 'open',
  },
  sort: 'name',
  page: {
    size: 10,
  },
}
```

To support this query, QueryQL only requires you to define (whitelist) what's
allowed through what we call a _querier_. Here's how one might look for the
`/images` endpoint:

```js
const QueryQL = require('@truepic/queryql')

class ImageQuerier extends QueryQL {
  defineSchema(schema) {
    schema.filter('id', 'in')
    schema.filter('status', '=')
    schema.sort('name')
    schema.page()
  }
}
```

With your querier defined, you can now call it in your router / controller.
Here's how it might look in an Express route:

```js
app.get('/images', async (req, res, next) => {
  const querier = new ImageQuerier(req.query, knex('images'))
  let images

  try {
    images = await querier.run()
  } catch (error) {
    // Handle validation error, such as by passing to an Express error handler:
    next(error)
  }

  res.send({ images })
})
```

Behind-the-scenes, QueryQL takes your initial query builder (`knex('images')`),
and applies the following Knex chain when `querier.run()` is called:

```js
builder
  .where('id', 'in', [2, 3])
  .where('status', '=', 'open')
  .orderBy('name', 'asc')
  .limit(10)
  .offset(0)
```

(Remember: While Knex is our default adapter and the query builder used in this
example, adapters can be written for any query builder / ORM.)

This is a simple example, but hopefully it illustrates how easy it is to add
filtering, sorting, and pagination to your REST API _without_ manually touching
your query builder / ORM.

[Read the full documentation](DOCS.md) to learn how to add validation, customize
the queries, and more.

## Development

### Prerequisites

The only prerequisite is a compatible version of Node.js (see `engines.node` in
[`package.json`](package.json)).

### Dependencies

Install dependencies with npm:

```bash
npm install
```

### Tests

[Jest](https://jestjs.io/) is our testing framework of choice. We strive for
100% code coverage.

To run the tests:

```bash
npm test
```

During development, it's recommended to run the tests automatically on file
change:

```bash
npm test -- --watch [--notify]
```

### Code Style & Linting

[Prettier](https://prettier.io/) is setup to enforce a consistent code style.
It's highly recommended to
[add an integration to your editor](https://prettier.io/docs/en/editors.html)
that automatically formats on save.

[ESLint](https://eslint.org/) is setup with the
["recommended" rules](https://eslint.org/docs/latest/rules/) to enforce a level
of code quality. It's also highly recommended to
[add an integration to your editor](https://eslint.org/docs/latest/use/integrations#editors)
that automatically formats on save.

To run via the command line:

```bash
npm run lint
```

## Releasing

After development is done in the `development` branch and is ready for release,
it should be merged into the `main` branch, where the latest release code lives.
[Release It!](https://github.com/release-it/release-it) is then used to
orchestrate the release process:

```bash
npm run release
```

Once the release process is complete, merge the `main` branch back into the
`development` branch. They should have the same history at this point.

# QueryQL

QueryQL makes it easy to add filtering, sorting, and pagination to your API
through your old friend: the query string!

## How it Works

QueryQL takes a parsed query string (like Express' `req.query`) and translates
it into the appropriate function calls that your query builder / ORM understands
to filter, sort, and paginate the records.

Let's consider an example to illustrate:

```
?filter[id][in][]=2&filter[id][in][]=3&filter[status]=open&sort=name&page[size]=10
```

```js
{
  filter: {
    id: {
      in: [2, 3]
    },
    status: 'open'
  },
  sort: 'name',
  page: {
    size: 10
  }
}
```

If you're using [Knex](https://knexjs.org/), this would translate into the
following query:

```js
builder
  .where('id', 'in', [2, 3])
  .where('status', '=', 'open')
  .orderBy('name', 'asc')
  .limit(10).offset(0)
```

To accomplish this, QueryQL only requires you to define (whitelist) what's
allowed through what we call a _querier_. Here's the querier for this
illustration:

```js
class ImageQuerier extends QueryQL {
  defineSchema (schema) {
    schema.filter('id', 'in')
    schema.filter('status', '=')
    schema.sort('name')
    schema.page()
  }
}
```

The last piece is calling this querier in your router / controller:

```js
const querier = new ImageQuerier(req.query, knex('images'))

const images = await querier.build()

// res.send({ images })
```

This is a simple example, but hopefully it illustrates how easy it is to add
filtering, sorting, and pagination to your API _without_ manually touching your
query builder / ORM. Read on to learn how to add validation, customize the
queries, and more.

## Queriers

What we call _queriers_ are at the heart of QueryQL. They map roughly 1-to-1
to models / tables / resources, but they don't have to. For example, say you
have a user resource – you could have a `UserQuerier` for your public API at
`/users`, and a more permissive `AdminUserQuerier` for your private API at
`/admin/users`. It's up to you.

The code behind queriers that maps calls to a query builder / ORM is called an
_adapter_. At this point, the only officially supported adapter is for
[Knex](https://knexjs.org/) – which is the default adapter out-of-the-box – but
anyone can build their own adapter by extending `BaseAdapter`. See the
`KnexAdapter` for a blueprint of how it's done.

### Defining a Querier

To define a querier, simply extend `QueryQL`:

```js
class UserQuerier extends QueryQL {
  defineSchema (schema) {
    // ...
  }
}
```

The only required function is `defineSchema (schema)`, which whitelists what's
allowed. However...

#### BaseQuerier

We highly recommend creating a `BaseQuerier` that all of your queriers extend,
instead of extending `QueryQL` each time. This allows you to set defaults and
encapsulate any other helper functions you need in one place. For example:

```js
class BaseQuerier extends QueryQL {
  get pageDefaults () {
    return {
      size: 10
    }
  }
}
```

```js
class UserQuerier extends BaseQuerier {
  defineSchema (schema) {
    // ...
  }
}
```

### Filtering

#### Query String Format

Filtering is specified under the `filter` key in the query string. A number of
formats are supported:

```
?filter[field]=value
?filter[field][operator]=value
```

`operator` is optional and defaults to `=` (although the adapter or querier can
override this if desired).

`value` can be anything: a string, number, boolean, array, or object. If an
object, however, the `operator` must be specified to avoid ambiguity.

#### Defining the Schema

In the querier's `defineSchema (schema)` function, a filter can be
added/whitelisted by calling:

```js
schema.filter(field, operator, options = {})
```

For example:

```js
schema.filter('id', 'in')
schema.filter('status', '=')
```

#### Customizing the Query

Most of the time, you can rely on the adapter to automatically apply the
appropriate function calls to your query builder / ORM. In some cases, however,
you may need to bypass the adapter and work with the query builder / ORM
directly.

This can easily be done by defining a function in your querier class to handle
the `field[operator]` combination. For example:

```js
'filter:id[in]' (builder, { field, operator, value }) {
  return builder.where(field, operator, value)
}
```

As you can see, you simply call the appropriate function(s) on the query builder
/ ORM and return the `builder`.

Now, this example is overly simplistic, and probably already handled
appropriately by the adapter. It becomes more useful, for example, when you have
a field that doesn't map directly to a field in your database, like a search
query:

```js
'filter:q[=]' (builder, { value }) {
  return builder
    .where('first_name', 'like', `%${value}%`)
    .orWhere('last_name', 'like', `%${value}%`)
}
```

#### Setting a Default

When the `filter` key isn't set in the query, you can set a default filter by
defining a `get defaultFilter ()` function in your querier. For example:

```js
get defaultFilter () {
  return {
    status: 2
  }
}
```

Any of the supported formats can be returned.

#### Changing the Defaults

Not to be confused with the previous section – which allows you to set a default
filter when none is specified – the defaults that are applied to _every_ filter
can be changed by defining a `get filterDefaults ()` function in
your querier. For example, here are the existing defaults:

```js
get filterDefaults () {
  return {
    field: null,
    operator: null,
    value: null
  }
}
```

You only need to return the keys you want to override.

### Sorting

#### Query String Format

Sorting is specified under the `sort` key in the query string. A number of
formats are supported:

```
?sort=field
?sort[]=field
?sort[field]=order
```

`order` can be `asc` or `desc` (case-insensitive), and defaults to `asc`.

`sort[]` and `sort[field]` support multiple fields, just be aware that the two
formats can't be mixed.

#### Defining the Schema

In the querier's `defineSchema (schema)` function, a sort can be
added/whitelisted by calling:

```js
schema.sort(field, options = {})
```

For example:

```js
schema.sort('name')
```

#### Customizing the Query

Most of the time, you can rely on the adapter to automatically apply the
appropriate function calls to your query builder / ORM. In some cases, however,
you may need to bypass the adapter and work with the query builder / ORM
directly.

This can easily be done by defining a function in your querier class to handle
the `field`. For example:

```js
'sort:name' (builder, { field, order }) {
  return builder.orderBy(field, order)
}
```

As you can see, you simply call the appropriate function(s) on the query builder
/ ORM and return the `builder`.

Now, this example is overly simplistic, and probably already handled
appropriately by the adapter. It becomes more useful, for example, when you have
a field that doesn't map directly to a field in your database:

```js
'sort:name' (builder, { order }) {
  return builder
    .orderBy('last_name', order)
    .orderBy('first_name', order)
}
```

#### Setting a Default

When the `sort` key isn't set in the query, you can set a default sort by
defining a `get defaultSort ()` function in your querier. For example:

```js
get defaultSort () {
  return 'name'
}
```

Any of the supported formats can be returned.

#### Changing the Defaults

Not to be confused with the previous section – which allows you to set a default
sort when none is specified – the defaults that are applied to _every_ sort can
be changed by defining a `get sortDefaults ()` function in your querier. For
example, here are the existing defaults:

```js
get sortDefaults () {
  return {
    field: null,
    order: 'asc'
  }
}
```

You only need to return the keys you want to override.

### Pagination

#### Query String Format

Pagination is specified under the `page` key in the query string. A number of
formats are supported:

```
?page=number
?page[number]=value&page[size]=value
```

`number` can be any positive integer, and defaults to `1`.

`size` can be any positive integer, and defaults to `20`.

#### Defining the Schema

In the querier's `defineSchema (schema)` function, pagination can be enabled
by calling:

```js
schema.page(isEnabledOrOptions = true)
```

For example:

```js
schema.page()
```

#### Setting a Default

When the `page` key isn't set in the query, you can set a default page by
defining a `get defaultPage ()` function in your querier. For example:

```js
get defaultPage () {
  return 2
}
```

Any of the supported formats can be returned.

#### Changing the Defaults

Not to be confused with the previous section – which allows you to set a default
page when none is specified – the defaults that are applied to _every_ page can
be changed by defining a `get pageDefaults ()` function in your querier. For
example, here are the existing defaults:

```js
get pageDefaults () {
  return {
    size: 20,
    number: 1
  }
}
```

You only need to return the keys you want to override.

### Validation

Oftentimes, it's helpful to validate the values passed in by a client. For
example, ensuring that a `status` filter is only `open` or `closed`, or that
`page[size]` isn't more than `100`.

QueryQL provides validation out-of-the-box with
[Joi](https://github.com/hapijs/joi). Simply define a
`defineValidation (schema)` function in your querier that returns the validation
schema:

```js
defineValidation (schema) {
  return schema.object().keys({
    'filter:status[=]': schema.string().valid('open', 'closed'),
    'page:size': schema.number().max(100)
  })
}
```

Validation is run when `build()` is called on the querier. A `ValidationError`
is thrown if/when it fails.

#### Building a Custom Validator

While Joi is provided out-of-the-box, any other validator can be plugged in by
extending `BaseValidator`. See the `JoiValidator` for a blueprint of how it's
done.

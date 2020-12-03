# QueryQL Documentation

- [Queriers](#queriers)
- [Config](#config)
- [Filtering](#filtering)
- [Sorting](#sorting)
- [Pagination](#pagination)
- [Validation](#validation)

## Queriers

What we call _queriers_ are at the heart of QueryQL. They map roughly 1-to-1 to
models / tables / resources, but they don't have to. For example, say you have a
user resource – you could have a `UserQuerier` for your public API at `/users`,
and a more permissive `AdminUserQuerier` for your private API at `/admin/users`.
It's up to you.

The code behind queriers that maps calls to a query builder / ORM is called an
_adapter_. At this point, the only officially supported adapter is for
[Knex](https://knexjs.org/) – which is the default adapter out of the box – but
anyone can build their own adapter.

### Defining a Querier

To define a querier, simply extend `QueryQL` with your own class:

```js
const QueryQL = require('@truepic/queryql')

class UserQuerier extends QueryQL {
  defineSchema(schema) {
    // ...
  }
}
```

The only required function is `defineSchema(schema)`, which whitelists what's
allowed. However...

#### BaseQuerier

We highly recommend creating a `BaseQuerier` that all of your queriers extend,
instead of extending `QueryQL` each time. This allows you to set defaults and
encapsulate any other functionality you need in one place. For example, to set
the default page size to 10 for all queriers:

```js
class BaseQuerier extends QueryQL {
  get pageDefaults() {
    return {
      size: 10,
    }
  }
}
```

```js
class UserQuerier extends BaseQuerier {
  defineSchema(schema) {
    // ...
  }
}
```

### Running

To run a querier, start by creating a new instance of one:

```js
const querier = new UserQuerier(query, builder, (config = {}))
```

- `query` is a parsed query string, like Express' `req.query`.
- `builder` is a query builder / ORM object that the configured adapter works
  with, like Knex.
- `config` is an optional instance-specific config that overrides the global
  config (see [Config](#config)).

Then call `run()`:

```js
let users

try {
  users = await querier.run()
} catch (error) {
  // Handle validation error...
}
```

If successful, the `builder` passed in when constructing the querier is returned
with the appropriate filtering, sorting, and pagination applied.

If validation fails, however, a `ValidationError` is thrown. See
[Validation](#validation) for more.

## Config

### Global

QueryQL uses the following config defaults:

```js
{
  adapter: KnexAdapter,
  validator: JoiValidator,
}
```

These defaults, however, can easily be changed for all querier instances. For
example, to use a different adapter:

```js
const { Config } = require('@truepic/queryql')

const MyAdapter = require('./my_adapter')

Config.defaults = {
  adapter: MyAdapter,
}
```

You only need to specify the keys you want to override – the defaults will be
used otherwise.

### Instance

A config can also be passed as the third argument when creating an instance of a
querier:

```js
const MyAdapter = require('./my_adapter')

const querier = new UserQuerier(query, builder, {
  adapter: MyAdapter,
})
```

## Filtering

### Query String Format

Filtering is specified under the `filter` key in the query string. A number of
formats are supported:

```
?filter[name]=value
?filter[name][operator]=value
```

- `operator` can be optional if the adapter specifies a default operator. If
  not, `operator` is required. `=` is the default operator for the Knex adapter.
- `value` can be a string, number, boolean, array, object, or `null`. If an
  object, however, the `operator` must be specified to avoid ambiguity. Each
  adapter can add additional validation to restrict the `value` of a specific
  `operator`. For example, an `in` operator might require an array `value`.

### Supported Operators

As you can see, both `operator` and `value` are very much adapter-specific. This
flexibility allows for adapters that work with SQL, NoSQL, APIs, etc., rather
than forcing them all into an SQL-like box.

That said, the default Knex adapter supports the following operators/values:

- `=`: string, number, or boolean
- `!=`: string, number, or boolean
- `<>`: string, number, or boolean
- `>`: string or number
- `>=`: string or number
- `<`: string or number
- `<=`: string or number
- `is`: `null` / `'null'` as a string / empty string (all mean the same)
- `is not`: `null` / `'null'` as a string / empty string (all mean the same)
- `in`: array of strings and/or numbers
- `not in`: array of strings and/or numbers
- `like`: string
- `not like`: string
- `ilike`: string
- `not ilike`: string
- `between`: array of two strings and/or numbers
- `not between`: array of two strings and/or numbers

### Defining the Schema

In the querier's `defineSchema(schema)` function, a filter can be
added/whitelisted by calling:

```js
schema.filter(name, operatorOrOperators, (options = {}))
```

For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  defineSchema(schema) {
    // ...
    schema.filter('id', 'in', { field: 'users.id' })
    schema.filter('status', ['=', '!='])
  }
}
```

#### Options

| Name    | Description                                                                            | Type   | Default     |
| ------- | -------------------------------------------------------------------------------------- | ------ | ----------- |
| `field` | The underlying field (i.e., database column) to use if different than the filter name. | String | Filter name |

### Customizing the Query

Most of the time, you can rely on the adapter to automatically apply the
appropriate function calls to your query builder / ORM. In some cases, however,
you may need to bypass the adapter and work with the query builder / ORM
directly.

This can easily be done by defining a function in your querier class to handle
the `name[operator]` combination. For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  'filter:id[in]'(builder, { name, field, operator, value }) {
    return builder.where(field, operator, value)
  }
}
```

As you can see, you simply call the appropriate function(s) on the query builder
/ ORM and return the `builder`.

Now, this example is overly simplistic, and probably already handled
appropriately by the adapter. It becomes more useful, for example, when you have
a filter that doesn't map directly to a field in your database, like a search
query:

```js
class UserQuerier extends BaseQuerier {
  // ...

  'filter:q[=]'(builder, { value }) {
    return builder
      .where('first_name', 'like', `%${value}%`)
      .orWhere('last_name', 'like', `%${value}%`)
  }
}
```

### Setting a Default

When the `filter` key isn't set in the query, you can set a default filter by
defining a `get defaultFilter()` function in your querier. For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  get defaultFilter() {
    return {
      status: 2,
    }
  }
}
```

Any of the supported formats can be returned.

### Changing the Defaults

Not to be confused with the previous section – which allows you to set a default
filter when none is specified – the defaults that are applied to _every_ filter
can be changed by defining a `get filterDefaults()` function in your querier.
For example, here are the existing defaults:

```js
class UserQuerier extends BaseQuerier {
  // ...

  get filterDefaults() {
    return {
      name: null,
      field: null,
      operator: null,
      value: null,
    }
  }
}
```

You only need to return the keys you want to override.

## Sorting

### Query String Format

Sorting is specified under the `sort` key in the query string. A number of
formats are supported:

```
?sort=name
?sort[]=name
?sort[name]=order
```

- `order` can be `asc` or `desc` (case-insensitive), and defaults to `asc`.
- `sort[]` and `sort[name]` support multiple sorts, just be aware that the two
  formats can't be mixed.

### Defining the Schema

In the querier's `defineSchema(schema)` function, a sort can be
added/whitelisted by calling:

```js
schema.sort(name, (options = {}))
```

For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  defineSchema(schema) {
    // ...
    schema.sort('name')
    schema.sort('status', { field: 'current_status' })
  }
}
```

#### Options

| Name    | Description                                                                          | Type   | Default   |
| ------- | ------------------------------------------------------------------------------------ | ------ | --------- |
| `field` | The underlying field (i.e., database column) to use if different than the sort name. | String | Sort name |

### Customizing the Query

Most of the time, you can rely on the adapter to automatically apply the
appropriate function calls to your query builder / ORM. In some cases, however,
you may need to bypass the adapter and work with the query builder / ORM
directly.

This can easily be done by defining a function in your querier class to handle
the `name`. For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  'sort:name'(builder, { name, field, order }) {
    return builder.orderBy(field, order)
  }
}
```

As you can see, you simply call the appropriate function(s) on the query builder
/ ORM and return the `builder`.

Now, this example is overly simplistic, and probably already handled
appropriately by the adapter. It becomes more useful, for example, when you have
a sort that doesn't map directly to a field in your database:

```js
class UserQuerier extends BaseQuerier {
  // ...

  'sort:name'(builder, { order }) {
    return builder.orderBy('last_name', order).orderBy('first_name', order)
  }
}
```

### Setting a Default

When the `sort` key isn't set in the query, you can set a default sort by
defining a `get defaultSort()` function in your querier. For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  get defaultSort() {
    return 'name'
  }
}
```

Any of the supported formats can be returned.

### Changing the Defaults

Not to be confused with the previous section – which allows you to set a default
sort when none is specified – the defaults that are applied to _every_ sort can
be changed by defining a `get sortDefaults()` function in your querier. For
example, here are the existing defaults:

```js
class UserQuerier extends BaseQuerier {
  // ...

  get sortDefaults() {
    return {
      name: null,
      field: null,
      order: 'asc',
    }
  }
}
```

You only need to return the keys you want to override.

## Pagination

### Query String Format

Pagination is specified under the `page` key in the query string. A number of
formats are supported:

```
?page=number
?page[number]=value&page[size]=value
```

- `number` can be any positive integer, and defaults to `1`.
- `size` can be any positive integer, and defaults to `20`.

### Defining the Schema

In the querier's `defineSchema(schema)` function, pagination can be enabled by
calling:

```js
schema.page((isEnabledOrOptions = true))
```

For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  defineSchema(schema) {
    // ...
    schema.page()
  }
}
```

### Setting a Default

When the `page` key isn't set in the query, you can set a default page by
defining a `get defaultPage()` function in your querier. For example:

```js
class UserQuerier extends BaseQuerier {
  // ...

  get defaultPage() {
    return 2
  }
}
```

Any of the supported formats can be returned.

### Changing the Defaults

Not to be confused with the previous section – which allows you to set a default
page when none is specified – the defaults that are applied to _every_ page can
be changed by defining a `get pageDefaults()` function in your querier. For
example, here are the existing defaults:

```js
class UserQuerier extends BaseQuerier {
  // ...

  get pageDefaults() {
    return {
      size: 20,
      number: 1,
    }
  }
}
```

You only need to return the keys you want to override.

## Validation

QueryQL and the configured adapter validate the query structure and value types
for free, without any additional configuration. You don't have to worry about
the client misspelling a name or using an unsupported filter operator – a
`ValidationError` will be thrown if they do.

Still, it's often helpful to add your own app-specific validation. For example,
ensuring that a `status` filter is only the string `open` or `closed`, or that
page `size` isn't greater than `100`. It's also recommended to prevent invalid
values from reaching your database and causing query errors.

QueryQL provides validation out of the box with
[Joi](https://github.com/hapijs/joi), although anyone can build their own
validator to use a validation library they're more familiar with.

### Defining the Schema

Simply define a `defineValidation(schema)` function in your querier that returns
the validation schema:

```js
class UserQuerier extends BaseQuerier {
  // ...

  defineValidation(schema) {
    return {
      'filter:status[=]': schema.string().valid('open', 'closed'),
      'page:size': schema.number().max(100),
    }
  }
}
```

### Running

Validation is triggered automatically when `run()` is called on the querier, but
can also be called manually with `validate()`. A `ValidationError` is thrown
if/when it fails.

### `ValidationError`

At this point, a `ValidationError` is simply an extended `Error`. It doesn't
include any additional fields or functions.

`ValidationError` is exported to make it easy to check for an instance of one:

```js
const { ValidationError } = require('@truepic/queryql').errors

const querier = new UserQuerier(query, builder)
let users

try {
  users = await querier.run()
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error.
  } else {
    // Other error, likely from the query builder / ORM.
  }
}
```

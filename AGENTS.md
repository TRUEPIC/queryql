# AGENTS.md

This file provides guidance to agentic agents like Claude Code when working with
code in this repository.

## Commands

- `npm test` — Run the full Jest suite. Test files live next to their source as
  `*.test.js` (the `/test/` directory is ignored as a test path; it only holds
  fixtures).
- `npm test -- --watch` — Re-run on file change during development.
- `npm test -- src/parsers/filter.test.js` — Run a single test file.
- `npm test -- -t "parses an object"` — Run tests matching a name pattern.
- `npm run lint` — Runs both `lint:format` (Prettier `--check`) and
  `lint:quality` (ESLint).
- `npm run lint:format:fix` / `npm run lint:quality:fix` — Auto-fix Prettier /
  ESLint issues.
- `npm run release` — Release It!-driven release. Run from `development`; after
  release, merge `development` into `main` (which always reflects the latest
  release).

CI runs `npm run lint` then `npm test -- --ci --coverage --runInBand` against
Node 20.x, 22.x, and 24.x. The package targets `node >= 20` and is CommonJS
(`require` / `module.exports`).

## Architecture

QueryQL turns a parsed query-string object (e.g. Express's `req.query`) into the
appropriate calls on a query builder / ORM. The user-facing surface is a single
class, `QueryQL`, that they subclass into a _querier_ per resource. The library
is structured as a pipeline orchestrated by `src/index.js`:

```
query (object)  →  Schema (whitelist)  →  Orchestrators  →  Parsers  →  Validators  →  Adapter  →  builder (mutated)
```

Key collaborators and the contracts between them:

- **`QueryQL` (`src/index.js`)** — Constructor wires `Config`, `Schema`, three
  orchestrators (`Filterer`, `Sorter`, `Pager`), an `adapter` instance, and a
  `validator`. `run()` validates, then runs each orchestrator in order, then
  returns the (now-modified) `builder`. The user only overrides
  `defineSchema()`; everything else has sensible defaults.
- **`Schema` (`src/schema.js`)** — In-memory whitelist.
  `filter(name, operator, options)` keys filters by `${name}[${operator}]`.
  `sort(name, options)` keys by name. `page(boolOrOptions)` toggles pagination.
  The schema is the source of truth for what's _allowed_; anything not
  whitelisted causes a `ValidationError`.
- **Orchestrators (`src/orchestrators/`)** — One per query type (`filterer`,
  `sorter`, `pager`), all extending `BaseOrchestrator`. Each owns a `queryKey`
  (`'filter'` / `'sort'` / `'page'`), a `schema` slice, an `isEnabled` check, a
  `buildParser()`, a `validate()`, and a `run()`. `apply()` is the dispatch
  point: it calls `querier[querierMethod]` if defined (e.g. `'filter:id[in]'`,
  `'sort:name'`), otherwise falls back to `adapter[queryKey]`.
- **Parsers (`src/parsers/`)** — Convert the raw query input into a normalized
  `Map` keyed by `${queryKey}:${name}[${operator}]` (filter),
  `${queryKey}:${name}` (sort), or `${queryKey}:${field}` (page). All extend
  `BaseParser`. `defineValidation(Joi)` returns a Joi schema used by
  `ParserValidator` to validate the _structure_ of the input. The parser also
  resolves the `field` option (defaulting to `name`) so downstream consumers
  always have a database column to target.
- **Adapters (`src/adapters/`)** — Bridge to specific query builders.
  `KnexAdapter` is the default; `BaseAdapter` defines the contract. An adapter
  declares `FILTER_OPERATORS` and `DEFAULT_FILTER_OPERATOR`, plus dispatch
  methods `filter:*` (catch-all), optional `filter:<op>` overrides, `sort`, and
  `page`. `BaseAdapter.filter()` looks up the right operator-specific method or
  falls back to `filter:*`. Adapters also supply per-operator value-type
  validation via `defineValidation(Joi)` (e.g. `'filter:in'` requires an array).
- **Validators** — Three layers, run on every `run()`:
  1. `ParserValidator` (`src/validators/parser.js`) — Validates raw query
     structure against the parser's Joi schema.
  2. `AdapterValidator` (`src/validators/adapter.js`) — Validates each
     filter/sort/page _value_ against the adapter's per-operator Joi schemas (so
     the operator's value-type contract is enforced before hitting the DB).
  3. Querier validator (`src/validators/querier/`, default `JoiValidator`) —
     User-defined app-specific validation from `defineValidation(schema)` on the
     querier (e.g.
     `'filter:status[=]': schema.string().valid('open', 'closed')`). All three
     throw `ValidationError` (from `src/errors/`); a Joi error is converted to a
     friendly path-prefixed message via
     `src/services/joi_validation_error_converter.js`.

### Two extension hooks worth knowing

- **Per-name/operator overrides on the querier** — Define
  `'filter:<name>[<operator>]'(builder, { name, field, operator, value })` or
  `'sort:<name>'(builder, { name, field, order })` to bypass the adapter for a
  specific entry (e.g. a fuzzy search filter that fans out across multiple
  columns). The orchestrator's `apply()` discovers these by name.
- **Per-operator overrides on the adapter** — Define `'filter:<operator>'` to
  specialize behavior for an operator across all filters; otherwise `'filter:*'`
  handles the operator generically.

### Defaults vs. "default <thing>"

The querier exposes two distinct customization patterns that are easy to
confuse:

- `get defaultFilter / defaultSort / defaultPage` — A fallback _value_ used when
  the client doesn't send `filter` / `sort` / `page` in the query.
- `get filterDefaults / sortDefaults / pageDefaults` — Defaults merged into
  _every_ parsed entry (e.g. `pageDefaults = { size: 10 }` to change the default
  page size). These overlay the `static DEFAULTS` on each parser;
  client-provided values can still override them, so enforce caps with
  validation.

### Caching

`validate()` and `parse()` on every orchestrator, plus `validate()` on every
parser, are wrapped by `src/services/cache_function.js`, which memoizes
zero-argument methods. They get called multiple times in a single `run()`
(validate → parse → apply), so this avoids redoing successful validation and
parse work. Thrown errors are not cached.

### Config

`Config` (`src/config.js`) holds the `adapter` and `validator` classes.
`Config.defaults = { ... }` mutates the global default; the third constructor
arg `new Querier(query, builder, { adapter })` overrides per-instance.

### Errors

All custom errors extend `BaseError` (`src/errors/base.js`), which sets `name`
from the constructor and captures the stack. Throw `ValidationError` for
user-facing validation failures and `NotImplementedError` for abstract methods
that subclasses must override (this is how `BaseAdapter`, `BaseParser`,
`BaseOrchestrator`, and `BaseValidator` enforce their contracts).

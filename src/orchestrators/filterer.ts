import BaseOrchestrator from './base'
import { FilterParser, Filter } from '../parsers/filter'
import type { FilterOperator } from '../types/filter_operator'

type RecordObj = Record<string, unknown>

interface FilterSchema {
  name: string | null
  operator: FilterOperator | null
  options?: RecordObj
}

export default class Filterer extends BaseOrchestrator<
  unknown,
  Map<string, FilterSchema>,
  Map<string, Filter>
> {
  parser!: FilterParser
  // Cache parsed filters between validate() and run() so validators can
  // mutate the same Filter objects (in-place coercion) and those changes
  // are visible when apply() is called.
  private _cachedFilters?: Map<string, Filter>
  get queryKey() {
    return 'filter'
  }

  get schema() {
    return this.querier.schema!.filters as Map<string, FilterSchema>
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  buildParser() {
    return new FilterParser(
      this.queryKey,
      this.query || (this.querier.defaultFilter as unknown),
      // `querier.schema` is provided at runtime by the querier implementation
      this.querier.schema as unknown as import('../schema').default,
      {
        operator: (
          this.querier.adapter.constructor as unknown as {
            DEFAULT_FILTER_OPERATOR: string
          }
        ).DEFAULT_FILTER_OPERATOR,
        ...(this.querier.filterDefaults as RecordObj | undefined),
      } as RecordObj,
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true
    }

    this.parser.validate()

    // Parse once and cache so validators operate on the same objects that
    // will later be consumed by run(). parse() creates new Filter objects on
    // each call, so calling it multiple times would lose any in-place
    // mutations performed by validators (notably Joi coercion).
    const filters = this.parse()
    if (filters) {
      this._cachedFilters = filters
    }

    // Adapter validator expects a Map keyed by filter key with an object containing operator and value
    this.querier.adapter.validator?.validateFilters(
      filters as unknown as Map<string, { operator: string; value: unknown }>,
    )
    // Querier-level validator expects an iterable of [key, { value }]
    this.querier.validator?.validateFilters(
      filters as unknown as Iterable<[string, { value: unknown }]>,
    )

    return true
  }

  run() {
    this.validate()

    // Reuse cached filters from validate() if present so any mutations made by
    // validators are preserved; otherwise parse now.
    const filters = this._cachedFilters ?? this.parse()

    if (!filters) {
      return this.querier
    }

    let key: string
    let filter: Filter | undefined

    for (const filterSchema of this.schema.values()) {
      // FilterParser.buildKey expects an object with `name` and `operator`.
      key = this.parser.buildKey(
        filterSchema as {
          name: string | null
          operator: FilterOperator | null
        },
      )
      filter = filters.get(key)

      if (filter) {
        this.apply(filter, key)
      }
    }

    // Clear cached filters after run to avoid leaking state between runs.
    this._cachedFilters = undefined

    return this.querier
  }
}

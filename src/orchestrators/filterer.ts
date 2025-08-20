import BaseOrchestrator from './base'
import FilterParser, { Filter } from '../parsers/filter'
import type { FilterOperator } from '../types/filter_operator'

type RecordObj = Record<string, unknown>

interface FilterSchema {
  name: string | null
  operator: FilterOperator | null
  options?: RecordObj
}

export default class Filterer extends BaseOrchestrator {
  parser!: FilterParser
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
      this.query || this.querier.defaultFilter,
      // `querier.schema` is provided at runtime by the querier implementation
      this.querier.schema!,
      {
        operator: (
          this.querier.adapter.constructor as {
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
    this.querier.adapter.validator?.validateFilters(this.parse())
    this.querier.validator?.validateFilters(this.parse())

    return true
  }

  run() {
    this.validate()

    const filters = this.parse()

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

    return this.querier
  }
}

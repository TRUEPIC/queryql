import type Schema from '../schema'
import BaseOrchestrator from './base'
import { SortParser, SortResult } from '../parsers/sort'

export default class Sorter extends BaseOrchestrator<
  unknown,
  Map<string, { name: string | null; options?: Record<string, unknown> }>,
  Map<string, SortResult>
> {
  parser!: SortParser

  get queryKey() {
    return 'sort'
  }

  get schema() {
    return this.querier.schema!.sorts as Map<
      string,
      { name: string | null; options?: Record<string, unknown> }
    >
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  buildParser() {
    return new SortParser(
      this.queryKey,
      this.query || (this.querier.defaultSort as unknown),
      this.querier.schema as unknown as Schema,
      this.querier.sortDefaults as Record<string, unknown> | undefined,
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true
    }

    this.parser.validate()
    this.querier.adapter.validator?.validateSorts(
      this.parse() as unknown as Map<string, { order: unknown }>,
    )
    this.querier.validator?.validateSorts(
      this.parse() as unknown as Iterable<[string, { order: unknown }]>,
    )

    return true
  }

  run() {
    this.validate()

    const sorts = this.parse() as Map<string, SortResult>

    if (!sorts) {
      return this.querier
    }

    for (const [key, sort] of sorts) {
      this.apply(sort, key)
    }

    return this.querier
  }
}

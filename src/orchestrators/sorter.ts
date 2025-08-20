import BaseOrchestrator from './base'
import SortParser, { SortResult } from '../parsers/sort'
import type Schema from '../schema'

export default class Sorter extends BaseOrchestrator {
  parser!: SortParser

  get queryKey() {
    return 'sort'
  }

  get schema() {
    return this.querier.schema!.sorts as Map<
      string,
      { name: string | null; options?: Record<string, any> }
    >
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  buildParser() {
    return new SortParser(
      this.queryKey,
      this.query || this.querier.defaultSort,
      this.querier.schema!,
      this.querier.sortDefaults,
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true
    }

    this.parser.validate()
    this.querier.adapter.validator?.validateSorts(this.parse())
    this.querier.validator?.validateSorts(this.parse())

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

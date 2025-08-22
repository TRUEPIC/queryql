import BaseOrchestrator from './base'
import PageParser from '../parsers/page'

export default class Pager extends BaseOrchestrator<
  unknown,
  import('../schema').default['pageOptions'],
  Map<string, { field: string; value: unknown }>
> {
  get queryKey() {
    return 'page'
  }

  get schema() {
    return this.querier.schema!.pageOptions
  }

  get isEnabled() {
    return !!this.schema.isEnabled
  }

  buildParser() {
    return new PageParser(
      this.queryKey,
      this.query || (this.querier.defaultPage as unknown),
      this.querier.schema as unknown as import('../schema').default,
      this.querier.pageDefaults as Record<string, unknown> | undefined,
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true
    }

    this.parser.validate?.()
    this.querier.adapter.validator.validatePage(
      this.parse() as unknown as Map<string, { field: string; value: unknown }>,
    )
    this.querier.validator?.validatePage(
      this.parse() as unknown as Iterable<[string, { value: unknown }]>,
    )

    return true
  }

  run() {
    this.validate()

    const page = this.parse()

    if (page) {
      // parser.flatten may be optional on the parser type
      this.apply(
        (
          this.parser.flatten as unknown as (
            v: Map<string, unknown>,
            f?: boolean,
          ) => Record<string, unknown>
        )(page, false),
      )
    }

    return this.querier
  }
}

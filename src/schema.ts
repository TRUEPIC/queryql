import is from 'is'

type Options = Record<string, any>

interface FilterDefinition {
  name: string
  operator: string
  options: Options
}

interface SortDefinition {
  name: string
  options: Options
}

type PageOptions = { isEnabled?: boolean } & Record<string, any>

class Schema {
  filters: Map<string, FilterDefinition>
  sorts: Map<string, SortDefinition>
  pageOptions: PageOptions = { isEnabled: false }

  constructor() {
    this.filters = new Map()
    this.sorts = new Map()
    this.page(false)
  }

  filter(
    name: string,
    operatorOrOperators: string | string[],
    options: Options = {},
  ): this {
    const operators = Array.isArray(operatorOrOperators)
      ? operatorOrOperators
      : [operatorOrOperators]

    for (const operator of operators) {
      this.filters.set(`${name}[${operator}]`, {
        name,
        operator,
        options,
      })
    }

    return this
  }

  sort(name: string, options: Options = {}): this {
    this.sorts.set(name, {
      name,
      options,
    })

    return this
  }

  page(isEnabledOrOptions: boolean | PageOptions = true): this {
    if (typeof isEnabledOrOptions === 'boolean') {
      this.pageOptions = { isEnabled: isEnabledOrOptions }
    } else {
      this.pageOptions = {
        ...isEnabledOrOptions,
        isEnabled:
          isEnabledOrOptions.isEnabled !== undefined
            ? isEnabledOrOptions.isEnabled
            : true,
      }
    }

    return this
  }

  mapFilterNamesToOperators(): Record<string, string[]> {
    const filters = Array.from(this.filters.values())

    return filters.reduce<Record<string, string[]>>((accumulator, filter) => {
      if (!accumulator[filter.name]) {
        accumulator[filter.name] = []
      }

      accumulator[filter.name].push(filter.operator)

      return accumulator
    }, {})
  }
}

export default Schema

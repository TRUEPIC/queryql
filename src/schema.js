const is = require('is')

class Schema {
  constructor() {
    this.filters = new Map()
    this.sorts = new Map()
    this.page(false)
  }

  filter(name, operatorOrOperators, options = {}) {
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

  sort(name, options = {}) {
    this.sorts.set(name, {
      name,
      options,
    })

    return this
  }

  page(isEnabledOrOptions = true) {
    if (is.bool(isEnabledOrOptions)) {
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

  mapFilterNamesToOperators() {
    const filters = Array.from(this.filters.values())

    return filters.reduce((accumulator, filter) => {
      if (!accumulator[filter.name]) {
        accumulator[filter.name] = []
      }

      accumulator[filter.name].push(filter.operator)

      return accumulator
    }, {})
  }
}

module.exports = Schema

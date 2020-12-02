const is = require('is')

class Schema {
  constructor() {
    this.filters = new Map()
    this.sorts = new Map()
    this.page(false)
  }

  filter(field, operatorOrOperators, options = {}) {
    const operators = Array.isArray(operatorOrOperators)
      ? operatorOrOperators
      : [operatorOrOperators]

    for (const operator of operators) {
      this.filters.set(`${field}[${operator}]`, {
        field,
        operator,
        options,
      })
    }

    return this
  }

  sort(field, options = {}) {
    this.sorts.set(field, {
      field,
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

  mapFilterFieldsToOperators() {
    const filters = Array.from(this.filters.values())

    return filters.reduce((accumulator, filter) => {
      if (!accumulator[filter.field]) {
        accumulator[filter.field] = []
      }

      accumulator[filter.field].push(filter.operator)

      return accumulator
    }, {})
  }
}

module.exports = Schema

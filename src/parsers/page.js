const is = require('is')

const BaseParser = require('./base')
const flattenMap = require('../services/flatten_map')

class PageParser extends BaseParser {
  static get DEFAULTS() {
    return {
      size: 20,
      number: 1,
    }
  }

  buildKey({ field }, includeQueryKey = true) {
    let key = field

    if (includeQueryKey) {
      key = `${this.queryKey}:${key}`
    }

    return key
  }

  defineValidation(schema) {
    return schema.alternatives().try(
      schema.number().integer().positive(),
      schema.object().keys({
        size: schema.number().integer().positive(),
        number: schema.number().integer().positive(),
      })
    )
  }

  flatten(map, includeQueryKey = true) {
    return flattenMap({
      map,
      key: (key, value) => this.buildKey(value, includeQueryKey),
      value: (value) => value.value,
    })
  }

  parseNumber() {
    return {
      ...this.defaults,
      number: this.query,
    }
  }

  parseObject() {
    return {
      ...this.defaults,
      ...this.query,
    }
  }

  parse() {
    this.validate()

    let page

    if (!this.query) {
      page = this.defaults
    } else if (is.number(this.query) || is.string(this.query)) {
      page = this.parseNumber()
    } else {
      page = this.parseObject()
    }

    page.offset = (page.number - 1) * page.size

    return new Map(
      Object.entries(page).map(([field, value]) => [
        this.buildKey({ field }),
        { field, value },
      ])
    )
  }
}

module.exports = PageParser

const is = require('is')

const BaseParser = require('./base')

class PageParser extends BaseParser {
  static get QUERY_KEY () { return 'page' }

  static get DEFAULTS () {
    return {
      size: 20,
      number: 1
    }
  }

  buildValidationSchema (schema) {
    return schema.alternatives().try([
      schema.number().integer().positive(),
      schema.object().keys({
        size: schema.number().integer().positive(),
        number: schema.number().integer().positive()
      })
    ])
  }

  parseNumber () {
    return {
      ...this.defaults,
      number: this.query
    }
  }

  parseObject () {
    return {
      ...this.defaults,
      ...this.query
    }
  }

  parse () {
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

    return page
  }
}

module.exports = PageParser

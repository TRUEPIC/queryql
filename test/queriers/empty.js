const QueryQL = require('../../src')

class EmptyQuerier extends QueryQL {
  defineSchema() {}
}

module.exports = EmptyQuerier

import QueryQL from '../../src'

class EmptyQuerier extends QueryQL {
  defineSchema() {}
}

module.exports = EmptyQuerier

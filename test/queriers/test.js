const QueryQL = require('../../src')

class TestQuerier extends QueryQL {
  defineSchema(schema) {
    schema.filter('test', '=')
    schema.filter('testing', '!=')
    schema.sort('test')
    schema.sort('testing')
    schema.page()
  }
}

module.exports = TestQuerier

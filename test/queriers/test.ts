import QueryQL from '../../src'
import type Schema from '../../src/schema'

export default class TestQuerier extends QueryQL {
  defineSchema(schema: Schema) {
    schema.filter('test', '=')
    schema.filter('testing', '!=')
    schema.sort('test')
    schema.sort('testing')
    schema.page()
  }
}

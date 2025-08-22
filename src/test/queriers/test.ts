import QueryQL from '../..'
import type { Schema } from '../../schema'

export default class TestQuerier extends QueryQL {
  defineSchema(schema: Schema) {
    schema.filter('test', '=')
    schema.filter('testing', '!=')
    schema.sort('test')
    schema.sort('testing')
    schema.page()
  }
}

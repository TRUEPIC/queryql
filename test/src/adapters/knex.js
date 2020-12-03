const knex = require('knex')({ client: 'pg' })

const KnexAdapter = require('../../../src/adapters/knex')
const ValidationError = require('../../../src/errors/validation')

describe('filter', () => {
  test('uses `field` for the column, not `name`', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'testing',
        operator: '=',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "testing" = 123')
  })

  test('supports the `=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '=',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" = 123')
  })

  test('supports the `!=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '!=',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" != 123')
  })

  test('supports the `<>` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '<>',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" <> 123')
  })

  test('supports the `>` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '>',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" > 123')
  })

  test('supports the `>=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '>=',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" >= 123')
  })

  test('supports the `<` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '<',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" < 123')
  })

  test('supports the `<=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: '<=',
        value: 123,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" <= 123')
  })

  test('supports the `is` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'is',
        value: null,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" is null')
  })

  test('supports the `is not` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'is not',
        value: null,
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" is not null')
  })

  test('supports the `in` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'in',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" in (123, 456)')
  })

  test('supports the `not in` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'not in',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" not in (123, 456)')
  })

  test('supports the `like` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'like',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" like \'%123%\'')
  })

  test('supports the `not like` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'not like',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" not like \'%123%\'')
  })

  test('supports the `ilike` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'ilike',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" ilike \'%123%\'')
  })

  test('supports the `not ilike` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'not ilike',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" not ilike \'%123%\'')
  })

  test('supports the `between` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'between',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" between 123 and 456')
  })

  test('supports the `not between` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        name: 'test',
        field: 'test',
        operator: 'not between',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe(
      'select * from "test" where "test" not between 123 and 456'
    )
  })
})

describe('sort', () => {
  test('adds an `order by` clause', () => {
    const query = new KnexAdapter()
      .sort(knex('test'), { name: 'test', field: 'test', order: 'desc' })
      .toString()

    expect(query).toBe('select * from "test" order by "test" desc')
  })

  test('uses `field` for the column, not `name`', () => {
    const query = new KnexAdapter()
      .sort(knex('test'), { name: 'test', field: 'testing', order: 'desc' })
      .toString()

    expect(query).toBe('select * from "test" order by "testing" desc')
  })
})

describe('page', () => {
  test('adds a `limit` clause', () => {
    const query = new KnexAdapter()
      .page(knex('test'), { size: 10, offset: 20 })
      .toString()

    expect(query).toBe('select * from "test" limit 10 offset 20')
  })
})

describe('validation', () => {
  describe('`filter:=`', () => {
    test('permits a boolean value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:=', 'test', true)).toBe(true)
    })

    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:=', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:=', 'test', 'valid')).toBe('valid')
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:=', 'test', null)).toThrow(
        new ValidationError('test must be one of [boolean, number, string]')
      )
    })
  })

  describe('`filter:!=`', () => {
    test('permits a boolean value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:!=', 'test', true)).toBe(true)
    })

    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:!=', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:!=', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:!=', 'test', null)).toThrow(
        new ValidationError('test must be one of [boolean, number, string]')
      )
    })
  })

  describe('`filter:<>`', () => {
    test('permits a boolean value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<>', 'test', true)).toBe(true)
    })

    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<>', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<>', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:<>', 'test', null)).toThrow(
        new ValidationError('test must be one of [boolean, number, string]')
      )
    })
  })

  describe('`filter:>`', () => {
    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:>', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:>', 'test', 'valid')).toBe('valid')
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:>', 'test', false)).toThrow(
        new ValidationError('test must be one of [number, string]')
      )
    })
  })

  describe('`filter:>=`', () => {
    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:>=', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:>=', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:>=', 'test', false)).toThrow(
        new ValidationError('test must be one of [number, string]')
      )
    })
  })

  describe('`filter:<`', () => {
    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<', 'test', 'valid')).toBe('valid')
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:<', 'test', false)).toThrow(
        new ValidationError('test must be one of [number, string]')
      )
    })
  })

  describe('`filter:<=`', () => {
    test('permits a number value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<=', 'test', 123)).toBe(123)
    })

    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:<=', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:<=', 'test', false)).toThrow(
        new ValidationError('test must be one of [number, string]')
      )
    })
  })

  describe('`filter:is`', () => {
    test('permits a `null` value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:is', 'test', null)).toBeNull()
    })

    test('permits a "null" string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:is', 'test', 'null')).toBeNull()
    })

    test('permits an empty string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:is', 'test', '')).toBeNull()
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:is', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be [null]'))
    })
  })

  describe('`filter:is not`', () => {
    test('permits a `null` value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:is not', 'test', null)).toBeNull()
    })

    test('permits a "null" string value', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:is not', 'test', 'null')
      ).toBeNull()
    })

    test('permits an empty string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:is not', 'test', '')).toBeNull()
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:is not', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be [null]'))
    })
  })

  describe('`filter:in`', () => {
    test('permits an array of number / string values', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:in', 'test', [123, 'test'])
      ).toEqual([123, 'test'])
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:in', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    })
  })

  describe('`filter:not in`', () => {
    test('permits an array of number / string values', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:not in', 'test', [123, 'test'])
      ).toEqual([123, 'test'])
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:not in', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    })
  })

  describe('`filter:like`', () => {
    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:like', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() => validator.validateValue('filter:like', 'test', 123)).toThrow(
        new ValidationError('test must be a string')
      )
    })
  })

  describe('`filter:not like`', () => {
    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:not like', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:not like', 'test', 123)
      ).toThrow(new ValidationError('test must be a string'))
    })
  })

  describe('`filter:ilike`', () => {
    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:ilike', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:ilike', 'test', 123)
      ).toThrow(new ValidationError('test must be a string'))
    })
  })

  describe('`filter:not ilike`', () => {
    test('permits a string value', () => {
      const validator = new KnexAdapter().validator

      expect(validator.validateValue('filter:not ilike', 'test', 'valid')).toBe(
        'valid'
      )
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:not ilike', 'test', 123)
      ).toThrow(new ValidationError('test must be a string'))
    })
  })

  describe('`filter:between`', () => {
    test('permits an array of two number values', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:between', 'test', [123, 456])
      ).toEqual([123, 456])
    })

    test('permits an array of two string values', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:between', 'test', ['test', 'test'])
      ).toEqual(['test', 'test'])
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:between', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    })
  })

  describe('`filter:not between`', () => {
    test('permits an array of two number values', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:not between', 'test', [123, 456])
      ).toEqual([123, 456])
    })

    test('permits an array of two string values', () => {
      const validator = new KnexAdapter().validator

      expect(
        validator.validateValue('filter:not between', 'test', ['test', 'test'])
      ).toEqual(['test', 'test'])
    })

    test('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:not between', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    })
  })
})

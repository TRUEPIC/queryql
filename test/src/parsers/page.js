const PageParser = require('../../../src/parsers/page')
const Schema = require('../../../src/schema')
const ValidationError = require('../../../src/errors/validation')

describe('DEFAULTS', () => {
  test('returns `20` as the default size', () => {
    expect(PageParser.DEFAULTS.size).toBe(20)
  })

  test('returns `1` as the default number', () => {
    expect(PageParser.DEFAULTS.number).toBe(1)
  })
})

describe('buildKey', () => {
  test('builds/returns a string to use as a key', () => {
    const parser = new PageParser('page', {}, new Schema())
    const key = parser.buildKey({
      field: 'size',
    })

    expect(key).toBe('page:size')
  })

  test('builds/returns a key without the query key, if specified', () => {
    const parser = new PageParser('page', {}, new Schema())
    const key = parser.buildKey(
      {
        field: 'size',
      },
      false
    )

    expect(key).toBe('size')
  })
})

describe('validation', () => {
  describe('`page=number`', () => {
    test('throws if the number is not an integer', () => {
      const parser = new PageParser('page', '1.1', new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page must be an integer')
      )
    })

    test('throws if the number is not positive', () => {
      const parser = new PageParser('page', '-1', new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page must be a positive number')
      )
    })
  })

  describe('`page[number]=value`', () => {
    test('throws if the number is not an integer', () => {
      const parser = new PageParser('page', { number: '1.1' }, new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:number must be an integer')
      )
    })

    test('throws if the number is not positive', () => {
      const parser = new PageParser('page', { number: '-1' }, new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:number must be a positive number')
      )
    })
  })

  describe('`page[size]=value`', () => {
    test('throws if the number is not an integer', () => {
      const parser = new PageParser('page', { size: '1.1' }, new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:size must be an integer')
      )
    })

    test('throws if the number is not positive', () => {
      const parser = new PageParser('page', { size: '-1' }, new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:size must be a positive number')
      )
    })
  })
})

describe('flatten', () => {
  test('flattens/returns parsed map into object with keys => values', () => {
    const parser = new PageParser('page', 2, new Schema())

    expect(parser.flatten(parser.parse())).toEqual({
      'page:size': 20,
      'page:number': 2,
      'page:offset': 20,
    })
  })

  test('optionally excludes the query key from the key', () => {
    const parser = new PageParser('page', 2, new Schema())

    expect(parser.flatten(parser.parse(), false)).toEqual({
      size: 20,
      number: 2,
      offset: 20,
    })
  })
})

describe('parse', () => {
  test('`page=number` with a string number', () => {
    const parser = new PageParser('page', '2', new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).toEqual({
      field: 'size',
      value: 20,
    })

    expect(parsed.get('page:number')).toEqual({
      field: 'number',
      value: 2,
    })

    expect(parsed.get('page:offset')).toEqual({
      field: 'offset',
      value: 20,
    })
  })

  test('`page=number` with a number number', () => {
    const parser = new PageParser('page', 2, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).toEqual({
      field: 'size',
      value: 20,
    })

    expect(parsed.get('page:number')).toEqual({
      field: 'number',
      value: 2,
    })

    expect(parsed.get('page:offset')).toEqual({
      field: 'offset',
      value: 20,
    })
  })

  test('`page[number]=value`', () => {
    const parser = new PageParser('page', { number: '2' }, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).toEqual({
      field: 'size',
      value: 20,
    })

    expect(parsed.get('page:number')).toEqual({
      field: 'number',
      value: 2,
    })

    expect(parsed.get('page:offset')).toEqual({
      field: 'offset',
      value: 20,
    })
  })

  test('`page[size]=value`', () => {
    const parser = new PageParser('page', { size: '10' }, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).toEqual({
      field: 'size',
      value: 10,
    })

    expect(parsed.get('page:number')).toEqual({
      field: 'number',
      value: 1,
    })

    expect(parsed.get('page:offset')).toEqual({
      field: 'offset',
      value: 0,
    })
  })

  test('`page[number]=value&page[size]=value`', () => {
    const parser = new PageParser(
      'page',
      { number: '2', size: '10' },
      new Schema().page()
    )
    const parsed = parser.parse()

    expect(parsed.get('page:size')).toEqual({
      field: 'size',
      value: 10,
    })

    expect(parsed.get('page:number')).toEqual({
      field: 'number',
      value: 2,
    })

    expect(parsed.get('page:offset')).toEqual({
      field: 'offset',
      value: 10,
    })
  })

  test('uses the defaults if no query', () => {
    const parser = new PageParser('page', undefined, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).toEqual({
      field: 'size',
      value: PageParser.DEFAULTS.size,
    })

    expect(parsed.get('page:number')).toEqual({
      field: 'number',
      value: PageParser.DEFAULTS.number,
    })

    expect(parsed.get('page:offset')).toEqual({
      field: 'offset',
      value: 0,
    })
  })

  test('throws `ValidationError` if invalid', () => {
    const parser = new PageParser('page', 'invalid', new Schema())

    expect(() => parser.parse()).toThrow(
      new ValidationError('page must be one of [number, object]')
    )
  })
})

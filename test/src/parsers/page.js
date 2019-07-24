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

describe('parse', () => {
  test('`page=number` with a string number', () => {
    const parser = new PageParser('page', '2', new Schema())

    expect(parser.parse()).toEqual({
      size: 20,
      number: '2',
      offset: 20,
    })
  })

  test('`page=number` with a number number', () => {
    const parser = new PageParser('page', 2, new Schema())

    expect(parser.parse()).toEqual({
      size: 20,
      number: 2,
      offset: 20,
    })
  })

  test('`page[number]=value`', () => {
    const parser = new PageParser('page', { number: '2' }, new Schema())

    expect(parser.parse()).toEqual({
      size: 20,
      number: '2',
      offset: 20,
    })
  })

  test('`page[size]=value`', () => {
    const parser = new PageParser('page', { size: '10' }, new Schema())

    expect(parser.parse()).toEqual({
      size: '10',
      number: 1,
      offset: 0,
    })
  })

  test('`page[number]=value&page[size]=value`', () => {
    const parser = new PageParser(
      'page',
      { number: '2', size: '10' },
      new Schema().page()
    )

    expect(parser.parse()).toEqual({
      size: '10',
      number: '2',
      offset: 10,
    })
  })

  test('uses the defaults if no query', () => {
    const parser = new PageParser('page', undefined, new Schema())

    expect(parser.parse()).toEqual({
      ...PageParser.DEFAULTS,
      offset: 0,
    })
  })

  test('throws `ValidationError` if invalid', () => {
    const parser = new PageParser('page', 'invalid', new Schema())

    expect(() => parser.parse()).toThrow(
      new ValidationError('page must be a number')
    )
  })
})

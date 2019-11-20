const ValidationError = require('../errors/validation')

module.exports = (error, pathPrefix = null) => {
  const detail = error.details[0]

  let path = detail.path.reduce(
    (accumulator, value, index) =>
      index === 0 ? `${value}` : `${accumulator}[${value}]`,
    null
  )

  if (pathPrefix) {
    path = path ? `${pathPrefix}:${path}` : pathPrefix
  }

  const message = detail.message.replace(/^".*?" /, '')

  return new ValidationError(`${path} ${message}`)
}

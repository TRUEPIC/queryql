import ValidationError from '../errors/validation'

export default function joiValidationErrorConverter(
  error: any,
  pathPrefix: string | null = null,
) {
  const detail = error.details[0]

  let path = detail.path.reduce(
    (accumulator: string | null, value: any, index: number) =>
      index === 0 ? `${value}` : `${accumulator}[${value}]`,
    null,
  )

  if (pathPrefix) {
    path = path ? `${pathPrefix}:${path}` : pathPrefix
  }

  const message = detail.message.replace(/^".*?" /, '')

  return new ValidationError(`${path} ${message}`)
}

import ValidationError from '../errors/validation'

type JoiDetail = {
  path: Array<string | number>
  message: string
}

export default function joiValidationErrorConverter(
  error: unknown,
  pathPrefix: string | null = null,
) {
  // Access the runtime Joi error shape safely
  const errLike = error as { details?: JoiDetail[] }
  const detail: JoiDetail = errLike.details
    ? errLike.details[0]
    : { path: [], message: 'Unknown Error' }

  let path = detail.path.reduce(
    (accumulator: string | null, value: string | number, index: number) =>
      index === 0 ? `${value}` : `${accumulator}[${value}]`,
    null,
  )

  if (pathPrefix) {
    path = path ? `${pathPrefix}:${path}` : pathPrefix
  }

  const message = detail.message.replace(/^".*?" /, '')

  return new ValidationError(`${path} ${message}`)
}

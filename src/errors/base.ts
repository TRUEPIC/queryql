export default class BaseError extends Error {
  constructor(message?: string) {
    super(message)

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name
  }
}

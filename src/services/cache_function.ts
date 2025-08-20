// Caches the return value of the first call to the function and returns that on
// subsequent calls. Only works with functions without arguments.
export default function cacheFunction<T>(
  func: Function,
  bind: any = undefined,
) {
  let cache: T | undefined = undefined

  return () => {
    if (cache === undefined) {
      cache = func.call(bind)
    }

    return cache
  }
}

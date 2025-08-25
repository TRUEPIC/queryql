// Caches the return value of the first call to the function and returns that on
// subsequent calls. Only works with functions without arguments.
export default function cacheFunction<T>(func: () => T, bind?: unknown) {
  let cache: T | undefined = undefined

  return () => {
    if (cache === undefined) {
      // If no bind is provided, call with globalThis so unbound functions
      // that access `this` behave consistently (return undefined instead
      // of throwing in strict mode).
      const ctx = bind === undefined ? globalThis : bind
      cache = func.call(ctx)
    }

    return cache
  }
}

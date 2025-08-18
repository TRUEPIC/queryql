// Caches the return value of the first call to the function and returns that on
// subsequent calls. Only works with functions without arguments.
const cacheFunction = (func: Function, bind: any = undefined) => {
  let cache = undefined

  return () => {
    if (cache === undefined) {
      cache = func.call(bind)
    }

    return cache
  }
}

export default cacheFunction

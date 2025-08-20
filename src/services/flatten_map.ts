export default function flattenMap<K, V, NV = V>(params: {
  map: Map<K, V>
  key?: (key: K, value: V) => string | number | symbol
  value?: (value: V, key: K) => NV
}): Record<string, NV> {
  const { map, key, value } = params
  const entries = Array.from(map.entries())

  return entries.reduce(
    (accumulator, [entryKey, entryValue]) => {
      const rawKey = key ? key(entryKey, entryValue) : (entryKey as unknown)
      const newKey = String(rawKey)
      const newValue = value
        ? value(entryValue, entryKey)
        : (entryValue as unknown as NV)

      return {
        ...accumulator,
        [newKey]: newValue,
      }
    },
    {} as Record<string, NV>,
  )
}

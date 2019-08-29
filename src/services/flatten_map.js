module.exports = ({ map, key = null, value = null }) => {
  const entries = Array.from(map.entries())

  return entries.reduce((accumulator, [entryKey, entryValue]) => {
    const newKey = key ? key(entryKey, entryValue) : entryKey
    const newValue = value ? value(entryValue, entryKey) : entryValue

    return {
      ...accumulator,
      [newKey]: newValue,
    }
  }, {})
}

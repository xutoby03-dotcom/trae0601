const camelToSnake = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

const convertKeys = (obj, converter) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter))
  }

  if (obj instanceof Date || obj instanceof FormData) {
    return obj
  }

  const result = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const convertedKey = converter(key)
      result[convertedKey] = convertKeys(obj[key], converter)
    }
  }
  return result
}

export const deepCamelToSnake = (obj) => {
  return convertKeys(obj, camelToSnake)
}

export const deepSnakeToCamel = (obj) => {
  return convertKeys(obj, snakeToCamel)
}

export { camelToSnake, snakeToCamel }

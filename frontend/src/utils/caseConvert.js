const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

const convertKeys = (obj, converter) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter))
  }

  const result = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = converter(key)
      result[newKey] = convertKeys(obj[key], converter)
    }
  }
  return result
}

export const snakeToCamel = (obj) => convertKeys(obj, toCamelCase)

export const camelToSnake = (obj) => convertKeys(obj, toSnakeCase)

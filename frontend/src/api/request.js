import axios from 'axios'
import { snakeToCamel, camelToSnake } from '@/utils/caseConvert'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    if (config.params && typeof config.params === 'object') {
      config.params = camelToSnake(config.params)
    }
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = camelToSnake(config.data)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      return snakeToCamel(response.data)
    }
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default request

import axios from 'axios'
import { message } from 'antd'
import { deepCamelToSnake, deepSnakeToCamel } from '@/utils/caseConvert'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const employeeId = localStorage.getItem('currentEmployeeId')
    if (employeeId) {
      config.headers['X-Employee-Id'] = employeeId
    }

    if (config.params && !(config.params instanceof FormData)) {
      config.params = deepCamelToSnake(config.params)
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.data = deepCamelToSnake(config.data)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.code === 0) {
      return deepSnakeToCamel(res.data)
    }

    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const errMsg = error.response?.data?.message || error.message || '网络错误'
    message.error(errMsg)
    return Promise.reject(error)
  }
)

export default request

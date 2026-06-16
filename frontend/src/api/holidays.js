import request from './request'

export const getHolidays = (params) => {
  return request.get('/holidays', { params })
}

export const getHolidayById = (id) => {
  return request.get(`/holidays/${id}`)
}

export const createHoliday = (data) => {
  return request.post('/holidays', data)
}

export const updateHoliday = (id, data) => {
  return request.put(`/holidays/${id}`, data)
}

export const deleteHoliday = (id) => {
  return request.delete(`/holidays/${id}`)
}

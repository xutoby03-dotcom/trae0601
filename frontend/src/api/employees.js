import request from './request'

export const getEmployees = (params) => {
  return request.get('/employees', { params })
}

export const getEmployeeById = (id) => {
  return request.get(`/employees/${id}`)
}

export const createEmployee = (data) => {
  return request.post('/employees', data)
}

export const updateEmployee = (id, data) => {
  return request.put(`/employees/${id}`, data)
}

export const deleteEmployee = (id) => {
  return request.delete(`/employees/${id}`)
}

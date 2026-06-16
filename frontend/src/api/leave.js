import request from './request'

export const getLeaveList = (params) => {
  return request.get('/leave', { params })
}

export const getLeaveById = (id) => {
  return request.get(`/leave/${id}`)
}

export const createLeave = (data) => {
  return request.post('/leave', data)
}

export const updateLeave = (id, data) => {
  return request.put(`/leave/${id}`, data)
}

export const deleteLeave = (id) => {
  return request.delete(`/leave/${id}`)
}

export const getAutoSubstitute = (employeeId, date) => {
  return request.get(`/leave/auto-substitute/${employeeId}/${date}`)
}

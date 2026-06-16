import request from './request'

export const getDutyList = (params) => {
  return request.get('/duty', { params })
}

export const getDutyById = (id) => {
  return request.get(`/duty/${id}`)
}

export const createDuty = (data) => {
  return request.post('/duty', data)
}

export const updateDuty = (id, data) => {
  return request.put(`/duty/${id}`, data)
}

export const deleteDuty = (id) => {
  return request.delete(`/duty/${id}`)
}

export const getDutySchedule = (params) => {
  return request.get('/duty/schedule', { params })
}

export const createDutySchedule = (data) => {
  return request.post('/duty/schedule', data)
}

export const deleteDutySchedule = (id) => {
  return request.delete(`/duty/schedule/${id}`)
}

export const getUpcomingHolidayPlants = () => {
  return request.get('/duty/upcoming-holiday-plants')
}

export const getTodayTasks = (params) => {
  return request.get('/duty/today', { params })
}

export const getPlantDuty = (plantId) => {
  return request.get(`/duty/plants/${plantId}`)
}

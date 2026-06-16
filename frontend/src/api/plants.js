import request from './request'

export const getPlants = (params) => {
  return request.get('/plants', { params })
}

export const getPlantById = (id) => {
  return request.get(`/plants/${id}`)
}

export const createPlant = (data) => {
  return request.post('/plants', data)
}

export const updatePlant = (id, data) => {
  return request.put(`/plants/${id}`, data)
}

export const deletePlant = (id) => {
  return request.delete(`/plants/${id}`)
}

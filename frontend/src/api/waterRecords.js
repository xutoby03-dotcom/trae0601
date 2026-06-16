import request from './request'

export const getWaterRecords = (params) => {
  return request.get('/water-records', { params })
}

export const getWaterRecordsByPlant = (plantId, params) => {
  return request.get(`/water-records/plant/${plantId}`, { params })
}

export const getWaterRecordById = (id) => {
  return request.get(`/water-records/${id}`)
}

export const createWaterRecord = (data) => {
  return request.post('/water-records', data)
}

export const updateWaterRecord = (id, data) => {
  return request.put(`/water-records/${id}`, data)
}

export const deleteWaterRecord = (id) => {
  return request.delete(`/water-records/${id}`)
}

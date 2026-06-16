import request from './request'

export const getPestReports = (params) => {
  return request.get('/pest-reports', { params })
}

export const getPestReportById = (id) => {
  return request.get(`/pest-reports/${id}`)
}

export const getPestReport = (id) => {
  return request.get(`/pest-reports/${id}`)
}

export const createPestReport = (data) => {
  const isFormData = data instanceof FormData
  return request.post('/pest-reports', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
}

export const updatePestReport = (id, data) => {
  return request.put(`/pest-reports/${id}`, data)
}

export const resolvePestReport = (id, resolvedNotes) => {
  return request.put(`/pest-reports/${id}/resolve`, { resolvedNotes })
}

export const deletePestReport = (id) => {
  return request.delete(`/pest-reports/${id}`)
}

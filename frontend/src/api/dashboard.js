import request from './request'

export const getSummary = () => {
  return request.get('/dashboard/summary')
}

export const getWaterRisk = () => {
  return request.get('/dashboard/water-risk')
}

export const getCompletionRate = () => {
  return request.get('/dashboard/completion-rate')
}

export const getWorstCorners = () => {
  return request.get('/dashboard/worst-corners')
}

export const getWeeklyStats = () => {
  return request.get('/dashboard/weekly-stats')
}

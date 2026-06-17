import request from './request'

export function getCalibrations(params) {
  return request({
    url: '/calibration',
    method: 'get',
    params,
  })
}

export function getCalibration(id) {
  return request({
    url: `/calibration/${id}`,
    method: 'get',
  })
}

export function createCalibration(data) {
  return request({
    url: '/calibration',
    method: 'post',
    data,
  })
}

export function updateCalibration(id, data) {
  return request({
    url: `/calibration/${id}`,
    method: 'put',
    data,
  })
}

export function deleteCalibration(id) {
  return request({
    url: `/calibration/${id}`,
    method: 'delete',
  })
}

export function getOvenCalibrations(ovenId, params) {
  return request({
    url: `/calibration/oven/${ovenId}`,
    method: 'get',
    params,
  })
}

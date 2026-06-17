import request from './request'

export function getOvens(params) {
  return request({
    url: '/ovens',
    method: 'get',
    params,
  })
}

export function getOven(id) {
  return request({
    url: `/ovens/${id}`,
    method: 'get',
  })
}

export function createOven(data) {
  return request({
    url: '/ovens',
    method: 'post',
    data,
  })
}

export function updateOven(id, data) {
  return request({
    url: `/ovens/${id}`,
    method: 'put',
    data,
  })
}

export function deleteOven(id) {
  return request({
    url: `/ovens/${id}`,
    method: 'delete',
  })
}

export function updateOvenStatus(id, status) {
  return request({
    url: `/ovens/${id}/status`,
    method: 'put',
    data: { status },
  })
}

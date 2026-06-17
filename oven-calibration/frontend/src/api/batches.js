import request from './request'

export function getBatches(params) {
  return request({
    url: '/batches',
    method: 'get',
    params,
  })
}

export function getBatch(id) {
  return request({
    url: `/batches/${id}`,
    method: 'get',
  })
}

export function createBatch(formData) {
  return request({
    url: '/batches',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function updateBatch(id, formData) {
  return request({
    url: `/batches/${id}`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function deleteBatch(id) {
  return request({
    url: `/batches/${id}`,
    method: 'delete',
  })
}

export function getOvenBatches(ovenId, params) {
  return request({
    url: `/batches/oven/${ovenId}`,
    method: 'get',
    params,
  })
}

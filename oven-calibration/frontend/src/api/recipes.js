import request from './request'

export function getRecipes(params) {
  return request({
    url: '/recipes',
    method: 'get',
    params,
  })
}

export function getRecipe(id) {
  return request({
    url: `/recipes/${id}`,
    method: 'get',
  })
}

export function createRecipe(data) {
  return request({
    url: '/recipes',
    method: 'post',
    data,
  })
}

export function updateRecipe(id, data) {
  return request({
    url: `/recipes/${id}`,
    method: 'put',
    data,
  })
}

export function deleteRecipe(id) {
  return request({
    url: `/recipes/${id}`,
    method: 'delete',
  })
}

import request from './request'

export function getOverview() {
  return request({
    url: '/dashboard/overview',
    method: 'get',
  })
}

export function getDeviationTrend(params) {
  return request({
    url: '/dashboard/deviation-trend',
    method: 'get',
    params,
  })
}

export function getMaintenanceAlerts() {
  return request({
    url: '/dashboard/maintenance-alerts',
    method: 'get',
  })
}

export function getAffectedProducts() {
  return request({
    url: '/dashboard/affected-products',
    method: 'get',
  })
}

export function getDecommissionCandidates() {
  return request({
    url: '/dashboard/decommission-candidates',
    method: 'get',
  })
}

export function getLayerPerformance() {
  return request({
    url: '/dashboard/layer-performance',
    method: 'get',
  })
}

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWarrantyStore } from '../store/warrantyStore'
import {
  isExpiringThisYear,
  getWarrantyStatus,
  getDaysLeft,
  formatShortDate,
} from '../utils/dateUtils'
import { WARRANTY_STATUS_COLOR, WARRANTY_STATUS_LABEL } from '../utils/constants'
import type { Device } from '../types'
import { AlertCircle, Wrench, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface CategoryStat {
  category: string
  count: number
}

export default function Dashboard() {
  const devices = useWarrantyStore((state) => state.devices)
  const maintenanceRecords = useWarrantyStore((state) => state.maintenanceRecords)

  const stats = useMemo(() => {
    let inWarranty = 0
    let expiringSoon = 0
    let expired = 0

    devices.forEach((device) => {
      const status = getWarrantyStatus(device)
      if (status === 'in-warranty') inWarranty++
      else if (status === 'expiring-soon') expiringSoon++
      else expired++
    })

    return {
      total: devices.length,
      inWarranty,
      expiringSoon,
      expired,
    }
  }, [devices])

  const expiringThisYearDevices = useMemo(() => {
    return devices
      .filter((d) => isExpiringThisYear(d))
      .sort((a, b) => getDaysLeft(a) - getDaysLeft(b))
  }, [devices])

  const currentYear = new Date().getFullYear()
  const thisYearRecords = useMemo(() => {
    return maintenanceRecords.filter((r) => {
      const recordYear = new Date(r.date).getFullYear()
      return recordYear === currentYear
    })
  }, [maintenanceRecords])

  const maintenanceCostStat = useMemo(() => {
    const totalCost = thisYearRecords.reduce((sum, r) => sum + r.cost, 0)
    return {
      totalCost,
      totalCount: thisYearRecords.length,
    }
  }, [thisYearRecords])

  const categoryStats = useMemo(() => {
    const categoryMap = new Map<string, number>()
    maintenanceRecords.forEach((record) => {
      const device = devices.find((d) => d.id === record.deviceId)
      if (device) {
        categoryMap.set(device.category, (categoryMap.get(device.category) || 0) + 1)
      }
    })
    const stats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }))
    stats.sort((a, b) => b.count - a.count)
    return stats.slice(0, 5)
  }, [maintenanceRecords, devices])

  const maxCategoryCount = useMemo(() => {
    if (categoryStats.length === 0) return 0
    return Math.max(...categoryStats.map((s) => s.count))
  }, [categoryStats])

  const recentRecords = useMemo(() => {
    const sorted = [...maintenanceRecords].sort((a, b) => b.date.localeCompare(a.date))
    return sorted.slice(0, 5)
  }, [maintenanceRecords])

  const getDeviceById = (id: string): Device | undefined => {
    return devices.find((d) => d.id === id)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">仪表盘</h1>
      </div>

      <div className="grid grid-cols-4">
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">设备总数</span>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">已注册的所有设备</div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">在保设备</span>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: WARRANTY_STATUS_COLOR['in-warranty'] }}>
            {stats.inWarranty}
          </div>
          <div className="text-xs text-gray-500 mt-1">{WARRANTY_STATUS_LABEL['in-warranty']}</div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">即将过保</span>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: WARRANTY_STATUS_COLOR['expiring-soon'] }}>
            {stats.expiringSoon}
          </div>
          <div className="text-xs text-gray-500 mt-1">90天内到期</div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">已过保</span>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: WARRANTY_STATUS_COLOR['expired'] }}>
            {stats.expired}
          </div>
          <div className="text-xs text-gray-500 mt-1">保修已过期</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card card-padding">
          <h2 className="text-lg font-semibold mb-4">今年即将过保的设备</h2>
          {expiringThisYearDevices.length > 0 ? (
            <div className="space-y-3">
              {expiringThisYearDevices.map((device) => {
                const daysLeft = getDaysLeft(device)
                const status = getWarrantyStatus(device)
                return (
                  <Link
                    key={device.id}
                    to={`/devices/${device.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ border: '1px solid var(--border-light)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{device.name}</div>
                      <div className="text-sm text-gray-500">{device.brand}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            status === 'in-warranty'
                              ? '#d1fae5'
                              : status === 'expiring-soon'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            status === 'in-warranty'
                              ? '#065f46'
                              : status === 'expiring-soon'
                              ? '#92400e'
                              : '#991b1b',
                        }}
                      >
                        {daysLeft > 0 ? `${daysLeft} 天` : '已过保'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">暂无即将过保设备</div>
              <div className="empty-state-desc">今年内没有设备会过保</div>
            </div>
          )}
        </div>

        <div className="card card-padding">
          <h2 className="text-lg font-semibold mb-4">维修花费统计</h2>
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">¥{maintenanceCostStat.totalCost.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">今年累计花费</div>
            </div>
            <div style={{ width: '1px', height: '60px', backgroundColor: 'var(--border)' }}></div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{maintenanceCostStat.totalCount}</div>
              <div className="text-sm text-gray-500 mt-1">维修记录数</div>
            </div>
          </div>
          {thisYearRecords.length === 0 && (
            <div className="text-center text-sm text-gray-500 mt-4">今年暂无维修记录</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card card-padding">
          <h2 className="text-lg font-semibold mb-4">最容易坏的品类</h2>
          {categoryStats.length > 0 ? (
            <div className="space-y-4">
              {categoryStats.map((stat, index) => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stat.category}</span>
                    <span className="text-sm text-gray-500">{stat.count} 次</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(stat.count / maxCategoryCount) * 100}%`,
                        backgroundColor:
                          index === 0
                            ? '#ef4444'
                            : index === 1
                            ? '#f59e0b'
                            : index === 2
                            ? '#eab308'
                            : index === 3
                            ? '#84cc16'
                            : '#22c55e',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">暂无数据</div>
              <div className="empty-state-desc">还没有维修记录数据</div>
            </div>
          )}
        </div>

        <div className="card card-padding">
          <h2 className="text-lg font-semibold mb-4">最近维修记录</h2>
          {recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => {
                const device = getDeviceById(record.deviceId)
                return (
                  <div
                    key={record.id}
                    className="p-3 rounded-lg"
                    style={{ border: '1px solid var(--border-light)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatShortDate(record.date)}</span>
                          {device && (
                            <Link
                              to={`/devices/${device.id}`}
                              className="font-medium text-gray-900 hover:text-indigo-600 truncate"
                            >
                              {device.name}
                            </Link>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-1">{record.fault}</div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-semibold text-gray-900">¥{record.cost}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <div className="empty-state-title">暂无维修记录</div>
              <div className="empty-state-desc">还没有任何维修记录</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

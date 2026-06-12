import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWarrantyStore } from '../store/warrantyStore'
import { getWarrantyStatus } from '../utils/dateUtils'
import { ROOMS, WARRANTY_STATUS_LABEL } from '../utils/constants'
import type { DeviceFilters, WarrantyStatus } from '../types'
import DeviceCard from '../components/DeviceCard'

type TabType = WarrantyStatus | 'all'

export default function DeviceList() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [filters, setFilters] = useState<DeviceFilters>({
    search: '',
    brand: '',
    room: '',
    warrantyStatus: 'all',
  })

  const devices = useWarrantyStore((state) => state.devices)

  const uniqueBrands = useMemo(() => {
    const brands = new Set(devices.map((d) => d.brand))
    return Array.from(brands).sort()
  }, [devices])

  const counts = useMemo(() => {
    let inWarranty = 0
    let expiringSoon = 0
    let expired = 0
    devices.forEach((device) => {
      const status = getWarrantyStatus(device)
      if (status === 'in-warranty') inWarranty++
      else if (status === 'expiring-soon') expiringSoon++
      else if (status === 'expired') expired++
    })
    return { inWarranty, expiringSoon, expired, all: devices.length }
  }, [devices])

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const status = getWarrantyStatus(device)

      const tabStatus = activeTab === 'all' ? null : activeTab
      const filterStatus = filters.warrantyStatus === 'all' ? null : filters.warrantyStatus
      const targetStatus = filterStatus || tabStatus

      if (targetStatus && status !== targetStatus) {
        return false
      }

      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !device.name.toLowerCase().includes(search) &&
          !device.brand.toLowerCase().includes(search) &&
          !device.model.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      if (filters.brand && device.brand !== filters.brand) {
        return false
      }

      if (filters.room && device.room !== filters.room) {
        return false
      }

      return true
    })
  }, [devices, activeTab, filters])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">设备列表</h1>
        <Link to="/devices/new" className="btn btn-primary">
          + 添加设备
        </Link>
      </div>

      <div className="tabs">
        <button
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          全部 <span className="badge badge-muted">{counts.all}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'in-warranty' ? 'active' : ''}`}
          onClick={() => setActiveTab('in-warranty')}
        >
          在保 <span className="badge badge-success">{counts.inWarranty}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'expiring-soon' ? 'active' : ''}`}
          onClick={() => setActiveTab('expiring-soon')}
        >
          快过保 <span className="badge badge-warning">{counts.expiringSoon}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
        >
          已过保 <span className="badge badge-danger">{counts.expired}</span>
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="搜索设备名称、品牌、型号..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          className="form-select"
          value={filters.brand}
          onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
        >
          <option value="">全部品牌</option>
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.room}
          onChange={(e) => setFilters((prev) => ({ ...prev, room: e.target.value }))}
        >
          <option value="">全部房间</option>
          {ROOMS.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.warrantyStatus}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              warrantyStatus: e.target.value as WarrantyStatus | 'all',
            }))
          }
        >
          <option value="all">全部状态</option>
          <option value="in-warranty">{WARRANTY_STATUS_LABEL['in-warranty']}</option>
          <option value="expiring-soon">{WARRANTY_STATUS_LABEL['expiring-soon']}</option>
          <option value="expired">{WARRANTY_STATUS_LABEL['expired']}</option>
        </select>
      </div>

      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-3">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">暂无设备</div>
          <div className="empty-state-desc">还没有添加任何设备，点击上方按钮添加您的第一个设备</div>
          <Link to="/devices/new" className="btn btn-primary">
            添加设备
          </Link>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWarrantyStore } from '../store/warrantyStore'
import { getWarrantyStatus } from '../utils/dateUtils'
import { ROOMS } from '../utils/constants'
import type { DeviceFilters } from '../types'
import DeviceCard from '../components/DeviceCard'

type TabType = 'in-warranty' | 'expired' | 'all'

export default function DeviceList() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [filters, setFilters] = useState<DeviceFilters>({
    search: '',
    brand: '',
    room: '',
  })

  const devices = useWarrantyStore((state) => state.devices)

  const uniqueBrands = useMemo(() => {
    const brands = new Set(devices.map((d) => d.brand))
    return Array.from(brands).sort()
  }, [devices])

  const counts = useMemo(() => {
    let inWarranty = 0
    let expired = 0
    devices.forEach((device) => {
      const status = getWarrantyStatus(device)
      if (status === 'expired') {
        expired++
      } else {
        inWarranty++
      }
    })
    return { inWarranty, expired, all: devices.length }
  }, [devices])

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const status = getWarrantyStatus(device)

      if (activeTab === 'in-warranty' && status === 'expired') {
        return false
      }
      if (activeTab === 'expired' && status !== 'expired') {
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

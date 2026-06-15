import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { StatusBadge, FirmwareBadge } from "@/components/StatusBadge"
import { DEPARTMENTS } from "@/data/mockData"
import { Search, Plus, Eye, ArrowRightLeft, Filter, X } from "lucide-react"
import type { Device } from "@/types"

export default function DeviceList() {
  const devices = useStore((s) => s.devices)
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<Device["status"] | "">("")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = devices.filter((d) => {
    if (search && !d.code.toLowerCase().includes(search.toLowerCase()) && !d.model.toLowerCase().includes(search.toLowerCase())) return false
    if (deptFilter && d.department !== deptFilter) return false
    if (statusFilter && d.status !== statusFilter) return false
    return true
  })

  const hasActiveFilters = deptFilter || statusFilter

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">样机资产</h2>
          <p className="text-sm text-slate-500 mt-1">管理所有样机设备的基本信息和状态</p>
        </div>
        <Link to="/devices/new" className="btn-primary">
          <Plus size={16} />
          新增样机
        </Link>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索编号或型号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? "ring-2 ring-brand-500/30" : ""}`}
          >
            <Filter size={16} />
            筛选
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={() => { setDeptFilter(""); setStatusFilter("") }}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <X size={14} />
              清除筛选
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">部门</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="select-field w-40"
              >
                <option value="">全部部门</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">状态</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Device["status"] | "")}
                className="select-field w-32"
              >
                <option value="">全部状态</option>
                <option value="idle">空闲</option>
                <option value="borrowed">借出</option>
                <option value="overdue">逾期</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">编号</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">型号</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">固件版本</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">归属部门</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">状态</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((device) => (
              <tr key={device.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-slate-800">{device.code}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{device.model}</td>
                <td className="px-4 py-3">
                  <FirmwareBadge current={device.firmwareVersion} standard={device.standardFirmware} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{device.department}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={device.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/devices/${device.id}`}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                      title="查看详情"
                    >
                      <Eye size={16} />
                    </Link>
                    {device.status === "idle" && (
                      <Link
                        to={`/borrow?deviceId=${device.id}`}
                        className="p-1.5 rounded-md hover:bg-brand-50 text-slate-500 hover:text-brand-600 transition-colors"
                        title="借出"
                      >
                        <ArrowRightLeft size={16} />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                  没有找到匹配的样机
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {devices.length} 台样机，当前显示 {filtered.length} 条
      </div>
    </div>
  )
}

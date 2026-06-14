import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, TestTubes, Thermometer, AlertTriangle, Calendar, Package } from 'lucide-react'
import { useStore } from '@/store'
import { SAMPLE_TYPES } from '@/types'
import type { Sample } from '@/types'
import { cn } from '@/lib/utils'

const HAZARD_COLORS: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-lime-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
}

const STATUS_CONFIG: Record<Sample['status'], { label: string; className: string }> = {
  normal: { label: '正常', className: 'bg-green-100 text-green-700' },
  expiring: { label: '即将过期', className: 'bg-amber-100 text-amber-700' },
  expired: { label: '已过期', className: 'bg-red-100 text-red-700' },
  temp_abnormal: { label: '温度异常', className: 'bg-orange-100 text-orange-700' },
}

export default function Samples() {
  const samples = useStore((s) => s.samples)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [hazardFilter, setHazardFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    return samples.filter((s) => {
      if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.batch.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter && s.type !== typeFilter) return false
      if (hazardFilter && s.hazardLevel !== Number(hazardFilter)) return false
      if (statusFilter && s.status !== statusFilter) return false
      return true
    })
  }, [samples, search, typeFilter, hazardFilter, statusFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">样本档案</h1>
          <Link
            to="/samples/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增样本
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索样本编号或批次号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              {SAMPLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部危险等级</option>
              {[1, 2, 3, 4, 5].map((l) => (
                <option key={l} value={l}>{l}级</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="expiring">即将过期</option>
              <option value="expired">已过期</option>
              <option value="temp_abnormal">温度异常</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sample) => {
            const statusCfg = STATUS_CONFIG[sample.status]
            const pct = sample.totalQuantity > 0 ? (sample.remainingQuantity / sample.totalQuantity) * 100 : 0
            return (
              <Link
                key={sample.id}
                to={`/samples/${sample.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 text-sm">{sample.code}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.className)}>
                    {statusCfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                    {sample.type}
                  </span>
                  <span className="text-xs text-gray-500">批次: {sample.batch}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">危险等级</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((l) => (
                      <div
                        key={l}
                        className={cn(
                          'w-3 h-3 rounded-full',
                          l <= sample.hazardLevel ? HAZARD_COLORS[l] : 'bg-gray-200'
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{sample.hazardLevel}级</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-500">
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>{sample.tempMin}℃ ~ {sample.tempMax}℃</span>
                  {sample.status === 'temp_abnormal' && (
                    <span className="text-orange-600 font-medium ml-1">(当前: {sample.currentTemp}℃)</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>有效期至 {sample.expiryDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-500">剩余量</span>
                      <span className="text-xs font-medium text-gray-700">
                        {sample.remainingQuantity}/{sample.totalQuantity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <TestTubes className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">暂无匹配的样本记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

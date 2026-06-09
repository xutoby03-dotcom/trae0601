import { useMemo, useState } from 'react'
import { useStoreContext } from '../store/context'
import { BarChart3, TrendingUp, Car, Wrench, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function Statistics() {
  const { vehicles, maintenanceRecords, faultRecords } = useStoreContext()
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString())
  const [selectedVehicle, setSelectedVehicle] = useState('all')

  const years = useMemo(() => {
    const set = new Set<string>()
    maintenanceRecords.forEach(r => set.add(r.date.slice(0, 4)))
    set.add(new Date().getFullYear().toString())
    return Array.from(set).sort().reverse()
  }, [maintenanceRecords])

  const yearRecords = useMemo(() => {
    const base = maintenanceRecords.filter(r => r.date.startsWith(selectedYear))
    if (selectedVehicle === 'all') return base
    return base.filter(r => r.vehicleId === selectedVehicle)
  }, [maintenanceRecords, selectedYear, selectedVehicle])

  const totalCost = useMemo(() =>
    yearRecords.reduce((sum, r) => sum + r.cost, 0),
    [yearRecords]
  )

  const costByCategory = useMemo(() => {
    const map = new Map<string, number>()
    yearRecords.forEach(r => {
      r.items.split(',').map(s => s.trim()).filter(Boolean).forEach(item => {
        map.set(item, (map.get(item) ?? 0) + r.cost / r.items.split(',').filter(Boolean).length)
      })
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
  }, [yearRecords])

  const monthlyCost = useMemo(() => {
    const map = new Map<number, number>()
    for (let i = 1; i <= 12; i++) map.set(i, 0)
    yearRecords.forEach(r => {
      const month = new Date(r.date).getMonth() + 1
      map.set(month, (map.get(month) ?? 0) + r.cost)
    })
    return Array.from(map.entries()).map(([month, cost]) => ({
      month: `${month}月`,
      cost: Math.round(cost * 100) / 100,
    }))
  }, [yearRecords])

  const mostExpensive = useMemo(() => {
    if (yearRecords.length === 0) return null
    return yearRecords.reduce((max, r) => r.cost > max.cost ? r : max, yearRecords[0])
  }, [yearRecords])

  const vehicleStats = useMemo(() => {
    const targetVehicles = selectedVehicle === 'all' ? vehicles : vehicles.filter(v => v.id === selectedVehicle)
    return targetVehicles.map(v => {
      const vRecords = yearRecords.filter(r => r.vehicleId === v.id)
      const totalCost = vRecords.reduce((sum, r) => sum + r.cost, 0)
      const faults = faultRecords.filter(f => f.vehicleId === v.id && f.date.startsWith(selectedYear))
      const costPerKm = v.currentMileage > 0 ? totalCost / v.currentMileage : 0
      return {
        id: v.id,
        plate: v.plateNumber,
        model: v.model,
        totalCost,
        recordCount: vRecords.length,
        faultCount: faults.length,
        mileage: v.currentMileage,
        costPerKm,
      }
    })
  }, [vehicles, yearRecords, faultRecords, selectedYear, selectedVehicle])

  const vehicleCostChart = useMemo(() =>
    vehicleStats.map(v => ({ name: v.plate, cost: Math.round(v.totalCost * 100) / 100 })),
    [vehicleStats]
  )

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">暂无统计数据</p>
        <p className="text-sm mt-1">添加车辆和保养记录后即可查看统计</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">养车统计</h2>
        <div className="flex items-center gap-2">
          <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="all">全部车辆</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            {years.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">年度总花费</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">¥{totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500">保养次数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{yearRecords.length}</p>
        </div>
      </div>

      {mostExpensive && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">最贵的维修项目</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{mostExpensive.items}</p>
              <p className="text-xs text-gray-500">
                {vehicles.find(v => v.id === mostExpensive.vehicleId)?.plateNumber} · {mostExpensive.date}
              </p>
            </div>
            <p className="text-xl font-bold text-red-500">¥{mostExpensive.cost.toFixed(2)}</p>
          </div>
        </div>
      )}

      {vehicleStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              {selectedVehicle === 'all' ? '每辆车平均每公里花费' : '每公里花费'}
            </span>
          </div>
          <div className="space-y-3">
            {vehicleStats.map(v => (
              <div key={v.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{v.plate}</span>
                  <span className="text-xs text-gray-500 ml-1.5">{v.model}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">¥{v.costPerKm.toFixed(4)}/km</p>
                  <p className="text-xs text-gray-400">总 ¥{v.totalCost.toFixed(0)} · {v.mileage.toLocaleString()} km</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vehicleCostChart.length > 0 && selectedVehicle === 'all' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">各车辆年度花费</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vehicleCostChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, '花费']} />
              <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyCost.some(m => m.cost > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">月度花费趋势</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, '花费']} />
              <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {costByCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">花费分类占比</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={costByCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1 }}
                fontSize={11}
              >
                {costByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, '花费']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {costByCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">分类明细</h3>
          <div className="space-y-2">
            {costByCategory.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">¥{cat.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

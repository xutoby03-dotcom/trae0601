import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStoreContext } from '../store/context'
import { Bell, AlertTriangle, Clock, Gauge, Car, Wrench, ChevronRight, Plus } from 'lucide-react'
import type { ReminderItem, ReminderGroup } from '../types'

export default function Dashboard() {
  const { vehicles, maintenanceRecords, faultRecords } = useStoreContext()

  const reminders = useMemo(() => {
    const items: ReminderItem[] = []

    vehicles.forEach(v => {
      if (v.insuranceExpiry) {
        const daysLeft = Math.ceil((new Date(v.insuranceExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        items.push({
          id: `ins-${v.id}`,
          vehicleId: v.id,
          vehiclePlate: v.plateNumber,
          type: 'insurance',
          label: '保险到期',
          remaining: daysLeft > 0 ? `还剩 ${daysLeft} 天` : `已逾期 ${-daysLeft} 天`,
          isOverdue: daysLeft < 0,
          isUrgent: daysLeft >= 0 && daysLeft <= 30,
          daysLeft,
        })
      }

      if (v.inspectionExpiry) {
        const daysLeft = Math.ceil((new Date(v.inspectionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        items.push({
          id: `insp-${v.id}`,
          vehicleId: v.id,
          vehiclePlate: v.plateNumber,
          type: 'inspection',
          label: '年检到期',
          remaining: daysLeft > 0 ? `还剩 ${daysLeft} 天` : `已逾期 ${-daysLeft} 天`,
          isOverdue: daysLeft < 0,
          isUrgent: daysLeft >= 0 && daysLeft <= 30,
          daysLeft,
        })
      }

      const vehicleRecords = maintenanceRecords
        .filter(r => r.vehicleId === v.id && r.nextSuggestedMileage > 0)
        .sort((a, b) => b.date.localeCompare(a.date))

      const itemMap = new Map<string, typeof vehicleRecords[0]>()
      vehicleRecords.forEach(r => {
        const parts = r.items.split(',').map(s => s.trim()).filter(Boolean)
        parts.forEach(part => {
          const existing = itemMap.get(part)
          if (!existing || r.date > existing.date) {
            itemMap.set(part, r)
          }
        })
      })

      itemMap.forEach((record, itemName) => {
        const kmLeft = record.nextSuggestedMileage - v.currentMileage
        const isOilRelated = itemName.includes('机油')
        const isTireRelated = itemName.includes('轮胎')
        const type: ReminderItem['type'] = isOilRelated ? 'mileage_oil' : isTireRelated ? 'mileage_tire' : 'mileage_other'

        items.push({
          id: `maint-${record.id}-${itemName}`,
          vehicleId: v.id,
          vehiclePlate: v.plateNumber,
          type,
          label: itemName,
          remaining: kmLeft > 0 ? `还有 ${kmLeft.toLocaleString()} km` : `已超出 ${(-kmLeft).toLocaleString()} km`,
          isOverdue: kmLeft < 0,
          isUrgent: kmLeft >= 0 && kmLeft <= 1500,
          kmLeft,
        })
      })
    })

    return items
  }, [vehicles, maintenanceRecords])

  const groups: ReminderGroup[] = useMemo(() => {
    const overdue = reminders.filter(r => r.isOverdue)
    const urgent = reminders.filter(r => r.isUrgent && !r.isOverdue)
    const upcoming = reminders.filter(r => !r.isUrgent && !r.isOverdue)

    const result: ReminderGroup[] = []
    if (overdue.length > 0) result.push({ title: '已逾期', items: overdue })
    if (urgent.length > 0) result.push({ title: '即将到期', items: urgent })
    if (upcoming.length > 0) result.push({ title: '后续提醒', items: upcoming })

    return result
  }, [reminders])

  const pendingFaults = faultRecords.filter(f => f.status !== 'resolved')

  const iconForType = (type: ReminderItem['type']) => {
    switch (type) {
      case 'insurance': return <Bell className="w-4 h-4" />
      case 'inspection': return <Clock className="w-4 h-4" />
      case 'mileage_oil': return <Gauge className="w-4 h-4" />
      case 'mileage_tire': return <Gauge className="w-4 h-4" />
      default: return <Gauge className="w-4 h-4" />
    }
  }

  const groupIcon = (title: string) => {
    if (title === '已逾期') return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (title === '即将到期') return <Clock className="w-5 h-5 text-amber-500" />
    return <Bell className="w-5 h-5 text-blue-500" />
  }

  const groupBg = (title: string) => {
    if (title === '已逾期') return 'border-red-200 bg-red-50/50'
    if (title === '即将到期') return 'border-amber-200 bg-amber-50/50'
    return 'border-blue-200 bg-blue-50/50'
  }

  const itemBg = (item: ReminderItem) => {
    if (item.isOverdue) return 'bg-red-50 border-red-100'
    if (item.isUrgent) return 'bg-amber-50 border-amber-100'
    return 'bg-white border-gray-100'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">保养提醒</h2>
        {vehicles.length > 0 && (
          <Link to="/maintenance" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
            <Plus className="w-4 h-4" />
            添加保养
          </Link>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16">
          <Car className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500 mb-2">还没有车辆</p>
          <p className="text-sm text-gray-400 mb-6">先添加一辆车，开始管理保养记录</p>
          <Link to="/vehicles" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            添加车辆
          </Link>
        </div>
      ) : (
        <>
          {pendingFaults.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-800">待处理故障 ({pendingFaults.length})</h3>
              </div>
              <div className="space-y-2">
                {pendingFaults.slice(0, 3).map(f => {
                  const v = vehicles.find(v => v.id === f.vehicleId)
                  return (
                    <Link key={f.id} to="/faults" className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100 hover:border-red-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{v?.plateNumber}</span>
                        <span className="text-sm text-gray-700">{f.description}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  )
                })}
                {pendingFaults.length > 3 && (
                  <Link to="/faults" className="text-xs text-red-600 hover:underline">查看全部 {pendingFaults.length} 条故障</Link>
                )}
              </div>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Bell className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p className="text-green-600 font-medium">一切正常</p>
              <p className="text-sm text-gray-400 mt-1">暂无需要提醒的保养项目</p>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(group => (
                <div key={group.title} className={`rounded-xl border p-4 ${groupBg(group.title)}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {groupIcon(group.title)}
                    <h3 className="font-semibold text-gray-800">{group.title}</h3>
                    <span className="text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">{group.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <div key={item.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${itemBg(item)}`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            item.isOverdue ? 'bg-red-100 text-red-600' :
                            item.isUrgent ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-50 text-blue-500'
                          }`}>
                            {iconForType(item.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{item.vehiclePlate}</span>
                              <span className="text-sm font-medium text-gray-800">{item.label}</span>
                            </div>
                            <p className={`text-xs mt-0.5 ${
                              item.isOverdue ? 'text-red-600 font-medium' :
                              item.isUrgent ? 'text-amber-600' :
                              'text-gray-500'
                            }`}>
                              {item.remaining}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link to="/vehicles" className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <Car className="w-6 h-6 mx-auto mb-1.5 text-blue-500" />
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              <p className="text-xs text-gray-500">车辆</p>
            </Link>
            <Link to="/maintenance" className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <Wrench className="w-6 h-6 mx-auto mb-1.5 text-amber-500" />
              <p className="text-2xl font-bold text-gray-900">{maintenanceRecords.length}</p>
              <p className="text-xs text-gray-500">保养记录</p>
            </Link>
            <Link to="/faults" className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1.5 text-red-400" />
              <p className="text-2xl font-bold text-gray-900">{pendingFaults.length}</p>
              <p className="text-xs text-gray-500">待处理故障</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

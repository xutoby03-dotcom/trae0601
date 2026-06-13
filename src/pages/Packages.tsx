import { useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PackageTable from '@/components/package/PackageTable'

export default function Packages() {
  const { refreshUrgentStatus } = useAppStore()

  useEffect(() => {
    refreshUrgentStatus()
  }, [refreshUrgentStatus])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
          <ClipboardList size={22} className="text-purple-600" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-xl text-slate-800">包裹记录中心</h2>
          <p className="text-sm text-slate-500">所有入柜包裹的完整生命周期记录</p>
        </div>
      </div>

      <PackageTable />
    </div>
  )
}

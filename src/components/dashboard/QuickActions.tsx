import { Plus, LogOut } from 'lucide-react'

interface QuickActionsProps {
  onCheckIn: () => void
  onCheckOut: () => void
}

export default function QuickActions({ onCheckIn, onCheckOut }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-2xl card-shadow p-5">
      <h3 className="font-serif font-bold text-lg text-slate-800 mb-4">快捷操作</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCheckIn}
          className="group relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-left transition-all hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <p className="font-bold text-base">包裹入柜</p>
            <p className="text-xs text-white/80 mt-0.5">登记新到包裹</p>
          </div>
        </button>

        <button
          onClick={onCheckOut}
          className="group relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-warning-500 to-orange-600 text-white text-left transition-all hover:shadow-lg hover:shadow-warning-500/30 hover:-translate-y-0.5"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
              <LogOut size={22} strokeWidth={2.5} />
            </div>
            <p className="font-bold text-base">包裹取件</p>
            <p className="text-xs text-white/80 mt-0.5">验证后领取包裹</p>
          </div>
        </button>
      </div>
    </div>
  )
}

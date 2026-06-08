import { useState } from 'react'
import { useWalkStore } from '@/store/useWalkStore'
import { Save, FolderOpen, Download, Trash2, X } from 'lucide-react'
import html2canvas from 'html2canvas'

function formatMinutes(m: number): string {
  if (m < 60) return `${m}分钟`
  const h = Math.floor(m / 60)
  const min = m % 60
  return min > 0 ? `${h}h${min}m` : `${h}h`
}

export default function RouteManager() {
  const routePlaces = useWalkStore((s) => s.routePlaces)
  const routeName = useWalkStore((s) => s.routeName)
  const setRouteName = useWalkStore((s) => s.setRouteName)
  const startTime = useWalkStore((s) => s.startTime)
  const setStartTime = useWalkStore((s) => s.setStartTime)
  const savedRoutes = useWalkStore((s) => s.savedRoutes)
  const saveRoute = useWalkStore((s) => s.saveRoute)
  const loadRoute = useWalkStore((s) => s.loadRoute)
  const deleteRoute = useWalkStore((s) => s.deleteRoute)
  const getStats = useWalkStore((s) => s.getStats)
  const [showSaved, setShowSaved] = useState(false)

  const handleExport = async () => {
    const el = document.createElement('div')
    el.style.cssText = `
      position: fixed; left: -9999px; top: 0;
      width: 480px; padding: 32px; background: #FFF8F0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      border-radius: 16px;
    `

    const stats = getStats()
    const name = routeName.trim() || '今日散步计划'

    el.innerHTML = `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:28px;font-weight:900;color:#3D2C2E;">🚶 ${name}</div>
        <div style="font-size:12px;color:#8B7073;margin-top:4px;">${new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · 出发时间 ${startTime}</div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:20px;justify-content:center;">
        <div style="background:#FFF7ED;padding:8px 16px;border-radius:12px;text-align:center;">
          <div style="font-size:10px;color:#F97316;">总时长</div>
          <div style="font-size:14px;font-weight:bold;color:#3D2C2E;">${Math.floor(stats.totalMinutes / 60)}h${stats.totalMinutes % 60}m</div>
        </div>
        <div style="background:#ECFDF5;padding:8px 16px;border-radius:12px;text-align:center;">
          <div style="font-size:10px;color:#34D399;">总距离</div>
          <div style="font-size:14px;font-weight:bold;color:#3D2C2E;">${stats.totalDistance.toFixed(1)}km</div>
        </div>
        <div style="background:#FFFBEB;padding:8px 16px;border-radius:12px;text-align:center;">
          <div style="font-size:10px;color:#FBBF24;">总花费</div>
          <div style="font-size:14px;font-weight:bold;color:#3D2C2E;">¥${stats.totalBudget}</div>
        </div>
      </div>
      <div style="border-top:1px dashed #E8D5C4;padding-top:16px;">
        ${routePlaces
          .map(
            (p, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 0;${i < routePlaces.length - 1 ? 'border-bottom:1px solid #F5E6D8;' : ''}">
            <div style="width:24px;height:24px;border-radius:50%;background:#F97316;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0;">${i + 1}</div>
            <span style="font-size:20px;">${p.emoji}</span>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:bold;color:#3D2C2E;">${p.name}</div>
              <div style="font-size:11px;color:#8B7073;">停留${p.stayMinutes}min · ¥${p.budget} · ${p.openTime}-${p.closeTime}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
      <div style="text-align:center;margin-top:20px;font-size:10px;color:#C4A8A0;">
        城市散步路线拼图 🧩
      </div>
    `

    document.body.appendChild(el)

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#FFF8F0',
        scale: 2,
      })

      const link = document.createElement('a')
      link.download = `${name}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      document.body.removeChild(el)
    }
  }

  return (
    <div className="px-4 py-3 border-t border-gray-100 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="给路线起个名字..."
          className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white/60
            focus:outline-none focus:border-[#F97316] transition-colors text-[#3D2C2E]"
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#8B7073]">🕐</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="text-xs px-2 py-2 rounded-xl border border-gray-200 bg-white/60
              focus:outline-none focus:border-[#F97316] transition-colors text-[#3D2C2E]"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={saveRoute}
          disabled={routePlaces.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
            bg-[#F97316] text-white hover:bg-orange-600 active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-100"
        >
          <Save size={12} />
          保存路线
        </button>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
            bg-white text-[#6B5356] border border-gray-200 hover:border-[#F97316] hover:text-[#F97316]
            active:scale-95 transition-all"
        >
          <FolderOpen size={12} />
          我的路线
          {savedRoutes.length > 0 && (
            <span className="bg-[#F97316] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {savedRoutes.length}
            </span>
          )}
        </button>
        <button
          onClick={handleExport}
          disabled={routePlaces.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
            bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-100"
        >
          <Download size={12} />
          {routePlaces.length === 0 ? '拼好再导' : '导出计划图'}
        </button>
      </div>

      {showSaved && savedRoutes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1.5 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-[#3D2C2E]">已保存的路线</span>
            <button onClick={() => setShowSaved(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          {savedRoutes.map((route) => (
            <div
              key={route.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => {
                  loadRoute(route.id)
                  setShowSaved(false)
                }}
                className="flex-1 text-left"
              >
                <div className="text-xs font-medium text-[#3D2C2E]">{route.name}</div>
                <div className="text-[10px] text-[#8B7073]">
                  {route.placeIds.length} 个地点 · {route.createdAt}
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-[#F97316]">
                    ⏱ {formatMinutes(route.totalMinutes)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-500">
                    🚶 {route.totalDistance.toFixed(1)}km
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-500">
                    💰 ¥{route.totalBudget}
                  </span>
                </div>
              </button>
              <button
                onClick={() => deleteRoute(route.id)}
                className="text-gray-300 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showSaved && savedRoutes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-xs text-[#8B7073]">还没有保存的路线</div>
        </div>
      )}
    </div>
  )
}

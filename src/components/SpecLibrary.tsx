import { useGrindingStore, ROAST_LEVELS, EQUIPMENTS, type GrindingSpec, genShortCode } from '@/store/grindingStore'
import { BookOpen, X, Trash2, FileDown, Star, MessageSquare, FileText, RefreshCw } from 'lucide-react'
import { useState } from 'react'

function SpecCard({ spec, onDelete, onReuse }: { spec: GrindingSpec; onDelete: () => void; onReuse: () => void }) {
  const roast = ROAST_LEVELS.find((r) => r.value === spec.roastLevel)
  const equip = EQUIPMENTS.find((e) => e.value === spec.equipment)
  const avgScore = ((spec.aromaIntensity + spec.layering + spec.persistence) / 3).toFixed(1)
  const shortCode = genShortCode(spec.createdAt, spec.id)

  return (
    <div className="bg-[#1E1810] border border-amber-900/30 rounded-xl p-4 hover:border-amber-700/40 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          <span className="inline-flex items-center bg-gradient-to-r from-amber-700/40 to-amber-600/30 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-300 tracking-wider shrink-0 mt-0.5">
            #{shortCode}
          </span>
          <div>
            <h4 className="text-amber-200 font-bold text-sm">{spec.spiceName}</h4>
            <p className="text-amber-600/40 text-[10px] mt-0.5 font-mono">
              {new Date(spec.createdAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).replace(/\//g, '-')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-bold">{avgScore}</span>
          </div>
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-amber-700/50 hover:text-red-400 transition-all p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border border-amber-800/30 text-amber-400/70"
          style={{ backgroundColor: `${roast?.color}20` }}
        >
          {roast?.label}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-400/70 border border-amber-800/20">
          {equip?.label}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-400/70 border border-amber-800/20">
          {spec.meshSize}目
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-400/70 border border-amber-800/20">
          {spec.shutdownTemp}℃
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-3">
        <div className="bg-[#1A1410] rounded-lg px-2 py-2 text-center border border-amber-900/20">
          <p className="text-amber-300 text-sm font-bold">{spec.aromaIntensity}</p>
          <p className="text-amber-700/50 text-[9px] mt-0.5">香气强度</p>
        </div>
        <div className="bg-[#1A1410] rounded-lg px-2 py-2 text-center border border-amber-900/20">
          <p className="text-amber-300 text-sm font-bold">{spec.layering}</p>
          <p className="text-amber-700/50 text-[9px] mt-0.5">层次感</p>
        </div>
        <div className="bg-[#1A1410] rounded-lg px-2 py-2 text-center border border-amber-900/20">
          <p className="text-amber-300 text-sm font-bold">{spec.persistence}</p>
          <p className="text-amber-700/50 text-[9px] mt-0.5">持久度</p>
        </div>
        <div className="bg-[#1A1410] rounded-lg px-2 py-2 text-center border border-amber-900/20">
          <p className="text-amber-300 text-sm font-bold">{spec.recipeRatio}%</p>
          <p className="text-amber-700/50 text-[9px] mt-0.5">配方占比</p>
        </div>
      </div>

      {spec.originalNotes && (
        <div className="mb-2">
          <p className="text-amber-700/40 text-[10px] mb-1 flex items-center gap-1">
            <MessageSquare className="w-2.5 h-2.5" /> 原记录备注
          </p>
          <p className="text-amber-500/50 text-[11px] leading-relaxed">
            {spec.originalNotes}
          </p>
        </div>
      )}

      {spec.specNotes && (
        <div className="border-t border-amber-900/20 pt-2 mb-3">
          <p className="text-amber-600/40 text-[10px] mb-1 flex items-center gap-1">
            <FileText className="w-2.5 h-2.5" /> 规范备注
          </p>
          <p className="text-amber-400/60 text-[11px] leading-relaxed">
            {spec.specNotes}
          </p>
        </div>
      )}

      <button
        onClick={onReuse}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-700/40 to-amber-600/40 text-amber-200 text-[11px] font-bold border border-amber-600/30 hover:from-amber-600/50 hover:to-amber-500/50 hover:border-amber-500/50 transition-all"
      >
        <RefreshCw className="w-3 h-3" />
        复用此规范 · 填回表单微调
      </button>
    </div>
  )
}

export default function SpecLibrary() {
  const { specs, deleteSpec, toggleSpecDrawer, specDrawerOpen, records, createSpec, loadSpecToCurrent } = useGrindingStore()
  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [specNotes, setSpecNotes] = useState('')
  const [filterSpice, setFilterSpice] = useState('')

  const handleCreateSpec = () => {
    if (!selectedRecordId) return
    createSpec(selectedRecordId, specNotes)
    setSelectedRecordId('')
    setSpecNotes('')
  }

  const filteredSpecs = filterSpice
    ? specs.filter((s) => s.spiceName.includes(filterSpice))
    : specs

  const uniqueSpices = [...new Set(specs.map((s) => s.spiceName))]

  return (
    <>
      <button
        onClick={toggleSpecDrawer}
        className="fixed top-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-800/80 to-amber-700/60 text-amber-200 text-sm font-bold backdrop-blur-sm border border-amber-600/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:from-amber-700/80 hover:to-amber-600/60 transition-all"
      >
        <BookOpen className="w-4 h-4" />
        规范库 ({specs.length})
      </button>

      {specDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleSpecDrawer} />
          <div className="relative ml-auto w-full max-w-md h-full bg-[#1A1410] border-l border-amber-900/30 shadow-[-8px_0_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-amber-900/20">
              <h3 className="text-lg font-bold text-amber-200" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                研磨规范库
              </h3>
              <button onClick={toggleSpecDrawer} className="text-amber-600/50 hover:text-amber-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-amber-900/20">
              <h4 className="text-amber-400/80 text-sm font-medium mb-3">沉淀新规范</h4>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full bg-[#231C14] border border-amber-900/40 rounded-lg px-3 py-2 text-amber-200 text-sm mb-3 focus:outline-none focus:border-amber-600/60 appearance-none cursor-pointer"
              >
                <option value="">选择一条记录…</option>
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.spiceName} · {r.meshSize}目 · {r.shutdownTemp}℃
                  </option>
                ))}
              </select>
              <textarea
                value={specNotes}
                onChange={(e) => setSpecNotes(e.target.value)}
                placeholder="添加规范备注（研磨要点、注意事项…）"
                rows={2}
                className="w-full bg-[#231C14] border border-amber-900/40 rounded-lg px-3 py-2 text-amber-200 text-sm placeholder:text-amber-700/30 focus:outline-none focus:border-amber-600/60 resize-none mb-3"
              />
              <button
                onClick={handleCreateSpec}
                disabled={!selectedRecordId}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100 text-sm font-bold hover:from-amber-600 hover:to-amber-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4 h-4" />
                沉淀为规范
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-400/60 text-sm">已保存 {filteredSpecs.length} 条规范</span>
                {uniqueSpices.length > 0 && (
                  <select
                    value={filterSpice}
                    onChange={(e) => setFilterSpice(e.target.value)}
                    className="bg-[#231C14] border border-amber-900/30 rounded-lg px-2 py-1 text-amber-400 text-xs focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">全部香料</option>
                    {uniqueSpices.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>

              {filteredSpecs.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-10 h-10 text-amber-800/30 mx-auto mb-3" />
                  <p className="text-amber-600/40 text-sm">尚无研磨规范</p>
                  <p className="text-amber-700/30 text-xs mt-1">保存记录后可沉淀为规范</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSpecs.map((spec) => (
                    <SpecCard key={spec.id} spec={spec} onDelete={() => deleteSpec(spec.id)} onReuse={() => loadSpecToCurrent(spec)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

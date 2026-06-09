import { useState } from 'react'
import { AlertTriangle, Plus, FileText, Image, ChevronDown, ChevronUp, Clock, User, Printer } from 'lucide-react'
import { useReportStore } from '@/stores/reportStore'
import { usePrinterStore } from '@/stores/printerStore'
import Modal from '@/components/Modal'
import { cn } from '@/lib/utils'
import type { Report, ReportType, ImpactLevel, ReportStatus } from '@/types'

const typeConfig: Record<ReportType, { label: string; color: string }> = {
  no_paper: { label: '缺纸', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  paper_jam: { label: '卡纸', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  no_ink: { label: '缺墨', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  faint_print: { label: '打印淡', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: '待处理', color: 'bg-red-500/20 text-red-400' },
  processing: { label: '处理中', color: 'bg-yellow-500/20 text-yellow-400' },
  closed: { label: '已关闭', color: 'bg-green-500/20 text-green-400' },
}

const impactConfig: Record<ImpactLevel, { label: string; color: string; dot: string }> = {
  low: { label: '低', color: 'text-green-400', dot: 'bg-green-400' },
  medium: { label: '中', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  high: { label: '高', color: 'text-red-400', dot: 'bg-red-400' },
}

export default function Reports() {
  const { reports, addReport, updateReportStatus } = useReportStore()
  const { printers } = usePrinterStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    printerId: '',
    type: 'no_paper' as ReportType,
    description: '',
    impactLevel: 'low' as ImpactLevel,
    photos: [] as string[],
  })

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setForm((prev) => ({ ...prev, photos: [...prev.photos, ev.target!.result as string] }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = () => {
    if (!form.printerId) return
    const report: Report = {
      id: 'r_' + Date.now(),
      printerId: form.printerId,
      type: form.type,
      description: form.description,
      photos: form.photos,
      impactLevel: form.impactLevel,
      mergedCount: 1,
      mergedFrom: [],
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: '当前用户',
    }
    addReport(report)
    setForm({ printerId: '', type: 'no_paper', description: '', impactLevel: 'low', photos: [] })
    setModalOpen(false)
  }

  const getPrinterName = (pid: string) => printers.find((p) => p.id === pid)?.name ?? pid
  const getPrinterLocation = (pid: string) => printers.find((p) => p.id === pid)?.location ?? ''

  const sorted = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={28} />
          故障报修
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus size={18} />
          新建报修
        </button>
      </div>

      <div className="relative pl-6 border-l-2 border-white/10 space-y-4">
        {sorted.map((report) => {
          const tc = typeConfig[report.type]
          const sc = statusConfig[report.status]
          const ic = impactConfig[report.impactLevel]
          const expanded = expandedIds.has(report.id)

          return (
            <div key={report.id} className="relative">
              <div className={cn('absolute -left-[25px] top-2 w-3 h-3 rounded-full border-2', ic.dot)} />
              <div className="bg-[#1a1a35] rounded-xl border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-2 py-0.5 rounded text-xs border', tc.color)}>{tc.label}</span>
                    {report.mergedCount > 1 && (
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        已合并 {report.mergedCount} 条
                      </span>
                    )}
                    <span className={cn('px-2 py-0.5 rounded text-xs', sc.color)}>{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <div className={cn('w-2 h-2 rounded-full', ic.dot)} />
                    <span className={ic.color}>影响: {ic.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Printer size={14} className="text-white/40" />
                  <span className="font-medium">{getPrinterName(report.printerId)}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-sm text-white/50">{getPrinterLocation(report.printerId)}</span>
                </div>

                {report.description && (
                  <p className="text-sm text-white/60 leading-relaxed">{report.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(report.createdAt).toLocaleString('zh-CN')}</span>
                  <span className="flex items-center gap-1"><User size={12} /> {report.createdBy}</span>
                </div>

                {report.status === 'open' && (
                  <button
                    onClick={() => updateReportStatus(report.id, 'processing' as ReportStatus)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    开始处理
                  </button>
                )}
                {report.status === 'processing' && (
                  <button
                    onClick={() => updateReportStatus(report.id, 'closed' as ReportStatus)}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    关闭报修
                  </button>
                )}

                {report.mergedCount > 1 && (
                  <div>
                    <button
                      onClick={() => toggleExpand(report.id)}
                      className="flex items-center gap-1 text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      合并详情
                    </button>
                    {expanded && (
                      <div className="mt-2 pl-3 border-l border-amber-500/20 space-y-1">
                        {report.mergedFrom.map((mid: string) => (
                          <div key={mid} className="text-xs text-white/40 flex items-center gap-1">
                            <FileText size={10} /> {mid}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-white/30">暂无报修记录</div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新建报修" className="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">选择打印机</label>
            <select
              value={form.printerId}
              onChange={(e) => setForm((f) => ({ ...f, printerId: e.target.value }))}
              className="w-full bg-[#12122a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
            >
              <option value="">请选择打印机</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {p.location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">故障类型</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(typeConfig) as [ReportType, typeof typeConfig[ReportType]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setForm((f) => ({ ...f, type: key }))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    form.type === key ? cfg.color : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                  )}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">问题描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-[#12122a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
              placeholder="请描述故障情况..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">上传照片</label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <Image size={24} className="text-white/30" />
                <span className="text-xs text-white/30">点击或拖拽上传图片</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            {form.photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.photos.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">影响程度</label>
            <div className="flex gap-3">
              {(Object.entries(impactConfig) as [ImpactLevel, typeof impactConfig[ImpactLevel]][]).map(([key, cfg]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="impact"
                    checked={form.impactLevel === key}
                    onChange={() => setForm((f) => ({ ...f, impactLevel: key }))}
                    className="accent-amber-500"
                  />
                  <span className={cn('text-sm', cfg.color)}>{cfg.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.printerId}
            className={cn(
              'w-full py-2.5 rounded-lg font-semibold transition-colors',
              form.printerId ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-white/10 text-white/30 cursor-not-allowed'
            )}
          >
            提交报修
          </button>
        </div>
      </Modal>
    </div>
  )
}

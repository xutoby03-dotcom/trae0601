import { useMemo, useRef, useState } from 'react'
import { Briefcase, Plus, Users2, X, Upload, FileText } from 'lucide-react'
import StatsPanel from '@/components/StatsPanel'
import FilterBar from '@/components/FilterBar'
import CandidateCard from '@/components/CandidateCard'
import { useReferralStore, generateId } from '@/store/referralStore'
import { POSITIONS, REFERRERS } from '@/types'
import { cn } from '@/lib/utils'

export default function ReferralPage() {
  const candidates = useReferralStore((s) => s.candidates)
  const filterPosition = useReferralStore((s) => s.filterPosition)
  const filterReferrer = useReferralStore((s) => s.filterReferrer)
  const addCandidate = useReferralStore((s) => s.addCandidate)

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    targetPosition: POSITIONS[0],
    referrer: REFERRERS[0],
    resumeName: '',
    bonusAmount: 5000,
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (resumeUrl) {
      URL.revokeObjectURL(resumeUrl)
    }

    const url = URL.createObjectURL(file)
    setResumeFile(file)
    setResumeUrl(url)
    setForm((prev) => ({ ...prev, resumeName: file.name }))
  }

  const clearFile = () => {
    if (resumeUrl) {
      URL.revokeObjectURL(resumeUrl)
    }
    setResumeFile(null)
    setResumeUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filterPosition && c.targetPosition !== filterPosition) return false
      if (filterReferrer && c.referrer !== filterReferrer) return false
      return true
    })
  }, [candidates, filterPosition, filterReferrer])

  const handleAdd = () => {
    if (!form.name.trim()) return

    const finalResumeName = resumeFile
      ? resumeFile.name
      : form.resumeName.trim() || `${form.name}-${form.targetPosition}-简历.pdf`

    const finalResumeUrl = resumeUrl || '#'

    addCandidate({
      name: form.name.trim(),
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      targetPosition: form.targetPosition,
      referrer: form.referrer,
      resumeUrl: finalResumeUrl,
      resumeName: finalResumeName,
      sourceDate: new Date().toISOString().slice(0, 10),
      bonusAmount: form.bonusAmount,
    })

    setForm({
      name: '',
      targetPosition: POSITIONS[0],
      referrer: REFERRERS[0],
      resumeName: '',
      bonusAmount: 5000,
    })
    setResumeFile(null)
    setResumeUrl('')
    setShowAdd(false)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-white border-b border-warm-200 sticky top-0 z-30 backdrop-blur bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terra to-sand flex items-center justify-center shadow-sm">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-charcoal">内推跟进系统</h1>
              <p className="text-xs text-warm-500">候选人全流程追踪 · 奖金状态一目了然</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-terra text-white hover:bg-terra-dark font-medium text-sm shadow-sm transition-all hover:shadow-md"
          >
            <Plus size={16} />
            新增候选人
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsPanel />
        <FilterBar />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
            <Users2 size={20} className="text-terra" />
            候选人列表
            <span className="text-sm font-normal text-warm-500">
              （共 {filtered.length} 人）
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 border-dashed p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <Users2 size={28} className="text-warm-400" />
            </div>
            <p className="text-warm-600 font-medium">暂无符合条件的候选人</p>
            <p className="text-warm-400 text-sm mt-1">
              请尝试调整筛选条件或新增候选人
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
              <h3 className="text-lg font-semibold text-charcoal">新增内推候选人</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 rounded-full hover:bg-warm-100 text-warm-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  候选人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    目标岗位
                  </label>
                  <select
                    value={form.targetPosition}
                    onChange={(e) => setForm({ ...form, targetPosition: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all appearance-none cursor-pointer"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    推荐人
                  </label>
                  <select
                    value={form.referrer}
                    onChange={(e) => setForm({ ...form, referrer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all appearance-none cursor-pointer"
                  >
                    {REFERRERS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  简历文件
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                {!resumeFile ? (
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-xl border-2 border-dashed border-warm-200 bg-warm-50 hover:bg-warm-100 hover:border-terra/40 cursor-pointer transition-all"
                  >
                    <Upload size={22} className="text-warm-400 mb-2" />
                    <span className="text-sm text-warm-600 font-medium">
                      点击上传简历文件
                    </span>
                    <span className="text-xs text-warm-400 mt-0.5">
                      支持 PDF、Word、TXT 格式
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-warm-50 border border-warm-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-terra/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-terra" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-warm-500">
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="p-1.5 rounded-lg hover:bg-warm-200 text-warm-500 hover:text-warm-700 transition-colors flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  推荐奖金（元）
                </label>
                <input
                  type="number"
                  value={form.bonusAmount}
                  onChange={(e) => setForm({ ...form, bonusAmount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-warm-50 border-t border-warm-200 flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-white border border-warm-200 text-warm-700 hover:bg-warm-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.name.trim()}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl font-medium transition-all',
                  'bg-terra text-white hover:bg-terra-dark',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

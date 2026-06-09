import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, AlertTriangle, ChevronRight, Save } from 'lucide-react'
import { useBakingStore } from '@/store/bakingStore'
import { PROBLEM_TAG_LABELS, type ProblemTag } from '@/types'
import { analyzeFailure, type FailureCause } from '@/utils/failureRules'

const ALL_TAGS: ProblemTag[] = [
  'cracking',
  'collapsing',
  'undercooked',
  'too_hard',
  'too_sweet',
  'burnt_outside_raw_inside',
  'no_color',
  'coarse_texture',
  'shrinking',
  'demolding_difficulty',
]

const CONFIDENCE_CONFIG = {
  high: { label: '高', badgeClass: 'bg-bake-red/10 text-bake-red', borderClass: 'border-bake-red' },
  medium: { label: '中', badgeClass: 'bg-bake-amber/10 text-bake-amber', borderClass: 'border-bake-amber' },
  low: { label: '低', badgeClass: 'bg-gray-100 text-gray-500', borderClass: 'border-gray-300' },
}

export default function FailureAnalysis() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getRecord, updateRecord } = useBakingStore()

  const record = id ? getRecord(id) : undefined

  const [selectedTags, setSelectedTags] = useState<ProblemTag[]>(record?.problemTags ?? [])

  const toggleTag = (tag: ProblemTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const analysisResult = useMemo(() => {
    if (selectedTags.length === 0 || !record) return new Map<ProblemTag, FailureCause[]>()
    return analyzeFailure(selectedTags, record)
  }, [selectedTags, record])

  const handleSaveAndContinue = () => {
    if (!id || !record) return
    updateRecord(id, { problemTags: selectedTags })
    navigate(`/version/${record.productId}`)
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-bake-cream flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-bake-amber mx-auto mb-3" />
          <p className="text-bake-dark font-body">未找到该烘焙记录</p>
          <Link
            to="/"
            className="inline-block mt-4 text-bake-brown hover:text-bake-dark underline font-body"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bake-cream font-body">
      <header className="bg-bake-card border-b border-bake-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg hover:bg-bake-warm transition-colors text-bake-brown"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-bake-dark truncate">
              失败原因分析
            </h1>
            <p className="text-xs text-bake-brown/60 truncate">{record.productName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-bake-dark mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-bake-amber" />
            选择问题标签
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-all font-medium ${
                    isSelected
                      ? 'bg-bake-brown text-white shadow-sm'
                      : 'bg-white text-bake-dark border border-bake-border hover:border-bake-caramel'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                  )}
                  {PROBLEM_TAG_LABELS[tag]}
                </button>
              )
            })}
          </div>
        </section>

        {selectedTags.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-bake-caramel mx-auto mb-3" />
            <p className="text-bake-brown/70 text-sm">请至少选择一个问题标签，以查看原因分析</p>
          </div>
        ) : (
          <section className="space-y-5">
            <h2 className="text-sm font-semibold text-bake-dark flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-bake-amber" />
              原因分析
            </h2>
            {selectedTags.map((tag) => {
              const causes = analysisResult.get(tag) ?? []
              if (causes.length === 0) return null
              return (
                <div key={tag} className="space-y-3">
                  <h3 className="text-sm font-bold text-bake-brown flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-bake-caramel" />
                    {PROBLEM_TAG_LABELS[tag]}
                  </h3>
                  <div className="space-y-2.5">
                    {causes.map((cause, idx) => {
                      const conf = CONFIDENCE_CONFIG[cause.confidence]
                      return (
                        <div
                          key={idx}
                          className={`bg-white rounded-bake border-l-4 ${conf.borderClass} p-4 shadow-sm`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-sm font-semibold text-bake-dark leading-snug">
                              {cause.reason}
                            </span>
                            <span
                              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${conf.badgeClass}`}
                            >
                              {conf.label}
                            </span>
                          </div>
                          <div className="bg-bake-warm/60 rounded-lg p-3 flex gap-2">
                            <Lightbulb className="w-4 h-4 text-bake-amber shrink-0 mt-0.5" />
                            <span className="text-xs text-bake-dark/80 leading-relaxed">
                              {cause.suggestion}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        <div className="pt-2 pb-8">
          <button
            onClick={handleSaveAndContinue}
            disabled={selectedTags.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-bake text-sm font-bold transition-all ${
              selectedTags.length > 0
                ? 'bg-bake-brown text-white hover:bg-bake-dark shadow-md active:scale-[0.98]'
                : 'bg-bake-border text-bake-brown/40 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            保存并继续
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  )
}

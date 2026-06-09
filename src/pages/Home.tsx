import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBakingStore } from '@/store/bakingStore'
import {
  PROBLEM_TAG_LABELS,
  PRODUCT_TYPE_LABELS,
  STATUS_LABELS,
  RESULT_LABELS,
  type BakingRecord,
} from '@/types'
import { Plus, ChefHat, AlertTriangle, CheckCircle2, Clock, Flame, ArrowRight } from 'lucide-react'

function TasteStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-xs ${i < score ? 'text-bake-caramel' : 'text-bake-border'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function PhotoOrPlaceholder({ record }: { record: BakingRecord }) {
  const photo = record.photos?.[0]
  if (photo) {
    return (
      <img
        src={photo}
        alt={record.productName}
        className="w-full h-full object-cover"
      />
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-bake-cream">
      <ChefHat className="w-8 h-8 text-bake-border" />
    </div>
  )
}

function RecentFailureCard({ record }: { record: BakingRecord }) {
  return (
    <Link
      to={`/record/${record.id}`}
      className="flex-shrink-0 w-56 rounded-xl border-2 border-bake-caramel/60 bg-bake-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="h-32 overflow-hidden">
        <PhotoOrPlaceholder record={record} />
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-display text-base font-semibold text-bake-dark truncate">
          {record.productName}
        </h3>
        <div className="flex items-center gap-2 text-xs text-bake-brown/70">
          <span>{PRODUCT_TYPE_LABELS[record.productType]}</span>
          <span>·</span>
          <span>{record.date}</span>
        </div>
        <span
          className={`inline-block text-xs px-1.5 py-0.5 rounded ${
            record.result === 'failure'
              ? 'bg-bake-red/15 text-bake-red'
              : 'bg-bake-amber/15 text-bake-amber'
          }`}
        >
          {RESULT_LABELS[record.result]}
        </span>
        {record.problemTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.problemTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-bake-caramel/10 text-bake-caramel"
              >
                {PROBLEM_TAG_LABELS[tag]}
              </span>
            ))}
            {record.problemTags.length > 2 && (
              <span className="text-[10px] text-bake-brown/50">
                +{record.problemTags.length - 2}
              </span>
            )}
          </div>
        )}
        <TasteStars score={record.tasteScore} />
      </div>
    </Link>
  )
}

function PendingReviewItem({ record }: { record: BakingRecord }) {
  return (
    <Link
      to={`/record/${record.id}`}
      className="flex items-center gap-3 p-3 rounded-lg bg-bake-card border border-bake-border hover:border-bake-amber/50 transition-colors"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <PhotoOrPlaceholder record={record} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-body text-sm font-medium text-bake-dark truncate">
            {record.productName}
          </h3>
          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-bake-amber/20 text-bake-amber font-medium">
            {STATUS_LABELS[record.status]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-bake-brown/60">
          <span>{PRODUCT_TYPE_LABELS[record.productType]}</span>
          <span>·</span>
          <span>{record.date}</span>
          <span>·</span>
          <span>{RESULT_LABELS[record.result]}</span>
        </div>
        {record.problemTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.problemTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-bake-amber/10 text-bake-amber"
              >
                {PROBLEM_TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-bake-brown/30 flex-shrink-0" />
    </Link>
  )
}

function ImprovedCard({ record, versionCount }: { record: BakingRecord; versionCount: number }) {
  return (
    <Link
      to={`/record/${record.id}`}
      className="rounded-xl border border-bake-green/30 bg-bake-card overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
    >
      <div className="absolute top-2 right-2 z-10">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bake-green/20 text-bake-green font-medium">
          <CheckCircle2 className="w-3 h-3" />
          v{versionCount}
        </span>
      </div>
      <div className="h-28 overflow-hidden">
        <PhotoOrPlaceholder record={record} />
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-display text-sm font-semibold text-bake-dark truncate pr-10">
          {record.productName}
        </h3>
        <div className="flex items-center gap-2 text-xs text-bake-brown/60">
          <span>{PRODUCT_TYPE_LABELS[record.productType]}</span>
          <span>·</span>
          <span>{record.date}</span>
        </div>
        <TasteStars score={record.tasteScore} />
      </div>
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: React.ElementType
  text: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-bake-brown/40">
      <Icon className="w-8 h-8 mb-2" />
      <span className="font-body text-sm">{text}</span>
    </div>
  )
}

export default function Home() {
  const records = useBakingStore((s) => s.records)
  const getRecordsByProduct = useBakingStore((s) => s.getRecordsByProduct)

  const recentFailures = useMemo(
    () =>
      records
        .filter((r) => r.result === 'failure' || r.result === 'partial')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [records]
  )

  const pendingReview = useMemo(
    () =>
      records
        .filter((r) => r.status === 'pending_review')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [records]
  )

  const improved = useMemo(() => {
    const improvedProductIds = new Set<string>()
    for (const r of records) {
      if (r.status === 'improved') {
        improvedProductIds.add(r.productId)
      }
    }
    const result: (BakingRecord & { versionCount: number })[] = []
    const seen = new Set<string>()
    for (const r of records) {
      if (improvedProductIds.has(r.productId) && !seen.has(r.productId)) {
        seen.add(r.productId)
        const versions = getRecordsByProduct(r.productId)
        const latest = versions.sort((a, b) => b.versionNumber - a.versionNumber)[0]
        if (latest) {
          result.push({ ...latest, versionCount: versions.length })
        }
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [records, getRecordsByProduct])

  return (
    <div className="min-h-screen bg-bake-light font-body">
      <header className="sticky top-0 z-30 bg-bake-cream/90 backdrop-blur-sm border-b border-bake-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-bake-caramel" />
            <h1 className="font-display text-lg font-bold text-bake-dark">烘焙翻车日记</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-bake-caramel font-medium">
              首页
            </Link>
            <Link to="/stats" className="text-bake-brown/60 hover:text-bake-dark transition-colors">
              统计
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8 pb-24">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-bake-red" />
            <h2 className="font-display text-base font-bold text-bake-dark">最近翻车</h2>
          </div>
          {recentFailures.length === 0 ? (
            <EmptyState icon={AlertTriangle} text="暂无翻车记录，继续保持！" />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {recentFailures.map((record) => (
                <RecentFailureCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-bake-amber" />
            <h2 className="font-display text-base font-bold text-bake-dark">待复盘</h2>
          </div>
          {pendingReview.length === 0 ? (
            <EmptyState icon={Clock} text="暂无待复盘记录" />
          ) : (
            <div className="space-y-2">
              {pendingReview.map((record) => (
                <PendingReviewItem key={record.id} record={record} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-bake-green" />
            <h2 className="font-display text-base font-bold text-bake-dark">已成功改良</h2>
          </div>
          {improved.length === 0 ? (
            <EmptyState icon={CheckCircle2} text="暂无成功改良记录" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {improved.map((record) => (
                <ImprovedCard key={record.id} record={record} versionCount={record.versionCount} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Link
        to="/record/new"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-bake-caramel text-white font-body font-medium shadow-lg hover:bg-bake-caramel/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        新建记录
      </Link>
    </div>
  )
}

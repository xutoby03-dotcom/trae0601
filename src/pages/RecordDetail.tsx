import { Link, useParams, useNavigate } from 'react-router-dom'
import { useBakingStore } from '@/store/bakingStore'
import {
  PROBLEM_TAG_LABELS,
  PRODUCT_TYPE_LABELS,
  RESULT_LABELS,
  STATUS_LABELS,
  ADJUSTMENT_ITEM_LABELS,
} from '@/types'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Thermometer,
  Clock,
  Droplets,
  Wheat,
  Star,
  AlertTriangle,
  GitBranch,
  ChevronRight,
  Camera,
  CheckCircle2,
} from 'lucide-react'

export default function RecordDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getRecord, deleteRecord, updateStatus, getRecordsByProduct } = useBakingStore()

  const record = id ? getRecord(id) : undefined

  if (!record) {
    return (
      <div className="min-h-screen bg-bake-cream flex items-center justify-center font-body">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-bake-amber mx-auto mb-3" />
          <p className="text-bake-dark">未找到该烘焙记录</p>
          <Link to="/" className="inline-block mt-4 text-bake-brown hover:text-bake-dark underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const versions = getRecordsByProduct(record.productId)
  const hasMultipleVersions = versions.length > 1

  const handleDelete = () => {
    if (confirm('确定删除这条记录吗？此操作不可撤销。')) {
      deleteRecord(record.id)
      navigate('/')
    }
  }

  const handleStatusChange = (status: 'pending_review' | 'improved' | 'failed') => {
    updateStatus(record.id, status)
  }

  return (
    <div className="min-h-screen bg-bake-cream font-body">
      <header className="sticky top-0 z-10 bg-bake-card/95 backdrop-blur-sm border-b border-bake-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-bake-warm transition-colors text-bake-brown">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-bake-dark truncate">
              {record.productName}
            </h1>
            <p className="text-xs text-bake-brown/60">
              {record.versionLabel} · {record.date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/record/${record.id}/edit`}
              className="p-2 rounded-lg hover:bg-bake-warm transition-colors text-bake-brown"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-bake-red/10 transition-colors text-bake-red/60 hover:text-bake-red"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
              record.result === 'success'
                ? 'bg-bake-green/15 text-bake-green'
                : record.result === 'failure'
                ? 'bg-bake-red/15 text-bake-red'
                : 'bg-bake-amber/15 text-bake-amber'
            }`}
          >
            {RESULT_LABELS[record.result]}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
              record.status === 'improved'
                ? 'bg-bake-green/15 text-bake-green'
                : record.status === 'pending_review'
                ? 'bg-bake-amber/15 text-bake-amber'
                : 'bg-bake-red/15 text-bake-red'
            }`}
          >
            {STATUS_LABELS[record.status]}
          </span>
          <span className="text-xs text-bake-brown/50">
            {PRODUCT_TYPE_LABELS[record.productType]}
          </span>
        </div>

        {record.photos.length > 0 && (
          <section className="rounded-bake bg-bake-card p-4 shadow-sm">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {record.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`照片 ${i + 1}`}
                  className="w-40 h-40 rounded-lg object-cover flex-shrink-0 border border-bake-border"
                />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-3">配方参数</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-bake-light">
              <Thermometer className="w-4 h-4 text-bake-red" />
              <div>
                <p className="text-[10px] text-bake-brown/50">烤箱温度</p>
                <p className="text-sm font-medium text-bake-dark">{record.ovenTemp}℃</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-bake-light">
              <Clock className="w-4 h-4 text-bake-amber" />
              <div>
                <p className="text-[10px] text-bake-brown/50">烘烤时间</p>
                <p className="text-sm font-medium text-bake-dark">{record.bakeTime}分钟</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-bake-light">
              <Wheat className="w-4 h-4 text-bake-caramel" />
              <div>
                <p className="text-[10px] text-bake-brown/50">面粉类型</p>
                <p className="text-sm font-medium text-bake-dark">{record.flourType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-bake-light">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-[10px] text-bake-brown/50">环境湿度</p>
                <p className="text-sm font-medium text-bake-dark">{record.humidity}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-3">口感评分</h2>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= record.tasteScore
                    ? 'fill-bake-caramel text-bake-caramel'
                    : 'text-bake-border'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-bake-dark font-medium">
              {record.tasteScore}/5
            </span>
          </div>
        </section>

        {record.problemTags.length > 0 && (
          <section className="rounded-bake bg-bake-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-bake-brown mb-3">问题标签</h2>
            <div className="flex flex-wrap gap-2">
              {record.problemTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-bake-red/10 text-bake-red"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {PROBLEM_TAG_LABELS[tag]}
                </span>
              ))}
            </div>
            <Link
              to={`/record/${record.id}/analysis`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-bake-caramel hover:text-bake-brown transition-colors"
            >
              查看原因分析
              <ChevronRight className="w-3 h-3" />
            </Link>
          </section>
        )}

        {record.adjustments.length > 0 && (
          <section className="rounded-bake bg-bake-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-bake-brown mb-3">本次调整</h2>
            <div className="space-y-2">
              {record.adjustments.map((adj) => (
                <div key={adj.id} className="flex items-center justify-between py-2 border-b border-bake-border last:border-0">
                  <span className="text-sm text-bake-dark">
                    {ADJUSTMENT_ITEM_LABELS[adj.item]}
                  </span>
                  <span className="text-sm text-bake-brown">
                    {adj.before} → {adj.after} {adj.unit}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {record.notes && (
          <section className="rounded-bake bg-bake-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-bake-brown mb-3">备注</h2>
            <p className="text-sm text-bake-dark/80 leading-relaxed whitespace-pre-wrap">
              {record.notes}
            </p>
          </section>
        )}

        {hasMultipleVersions && (
          <Link
            to={`/compare/${record.productId}`}
            className="flex items-center justify-between p-4 rounded-bake bg-bake-caramel/10 border border-bake-caramel/30 hover:bg-bake-caramel/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-bake-caramel" />
              <span className="text-sm font-medium text-bake-dark">
                对比全部 {versions.length} 个版本
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-bake-caramel" />
          </Link>
        )}

        <section className="rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-3">更新状态</h2>
          <div className="flex gap-2">
            {(['pending_review', 'improved', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  record.status === status
                    ? status === 'improved'
                      ? 'bg-bake-green text-white'
                      : status === 'pending_review'
                      ? 'bg-bake-amber text-white'
                      : 'bg-bake-red text-white'
                    : 'bg-bake-light text-bake-brown/60 hover:bg-bake-warm'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </section>

        <div className="flex gap-3 pt-2 pb-8">
          <Link
            to={`/record/${record.id}/analysis`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-bake bg-bake-amber/15 text-bake-amber font-medium text-sm hover:bg-bake-amber/25 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            失败分析
          </Link>
          <Link
            to={`/version/${record.productId}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-bake bg-bake-caramel/15 text-bake-caramel font-medium text-sm hover:bg-bake-caramel/25 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            版本管理
          </Link>
        </div>
      </main>
    </div>
  )
}

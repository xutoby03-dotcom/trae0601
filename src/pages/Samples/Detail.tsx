import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Thermometer, AlertTriangle, Calendar, Package, Clock, Trash2, Edit2, TestTubes } from 'lucide-react'
import { useStore } from '@/store'
import { SAMPLE_TYPES } from '@/types'
import { cn } from '@/lib/utils'

const HAZARD_COLORS: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-lime-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
}

const HAZARD_LABELS: Record<number, string> = {
  1: '1级 - 低风险',
  2: '2级 - 一般风险',
  3: '3级 - 中等风险',
  4: '4级 - 较高风险',
  5: '5级 - 高风险',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  normal: { label: '正常', className: 'bg-green-100 text-green-700' },
  expiring: { label: '即将过期', className: 'bg-amber-100 text-amber-700' },
  expired: { label: '已过期', className: 'bg-red-100 text-red-700' },
  temp_abnormal: { label: '温度异常', className: 'bg-orange-100 text-orange-700' },
}

export default function SampleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { samples, checkouts, returns, deleteSample } = useStore()

  const sample = samples.find((s) => s.id === id)

  if (!sample) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <TestTubes className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-400 mb-4">未找到该样本</p>
        <Link to="/samples" className="btn-primary">返回样本列表</Link>
      </div>
    )
  }

  const sampleCheckouts = checkouts.filter((c) => c.sampleId === sample.id)
  const sampleReturns = returns.filter((r) => r.sampleId === sample.id)
  const statusCfg = STATUS_CONFIG[sample.status] || STATUS_CONFIG.normal
  const pct = sample.totalQuantity > 0 ? (sample.remainingQuantity / sample.totalQuantity) * 100 : 0
  const daysToExpiry = Math.ceil((new Date(sample.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const tempOk = sample.currentTemp >= sample.tempMin && sample.currentTemp <= sample.tempMax

  const handleDelete = () => {
    if (confirm('确定要删除该样本吗？此操作不可恢复。')) {
      deleteSample(sample.id)
      navigate('/samples')
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/samples" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif-title">{sample.code}</h1>
            <p className="text-sm text-gray-500 mt-0.5">样本详情</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5 text-sm">
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">样本编号</p>
                <p className="font-mono font-semibold text-gray-900">{sample.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">样本类型</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-sm font-medium">
                  {sample.type}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">批次号</p>
                <p className="text-gray-900">{sample.batch}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">状态</p>
                <span className={cn('badge', statusCfg.className)}>{statusCfg.label}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">保存条件</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', tempOk ? 'bg-green-100' : 'bg-red-100')}>
                  <Thermometer className={cn('w-5 h-5', tempOk ? 'text-green-600' : 'text-red-600')} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">保存温度范围</p>
                  <p className="text-gray-900 font-medium">{sample.tempMin}℃ ~ {sample.tempMax}℃</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', tempOk ? 'bg-green-100' : 'bg-red-100')}>
                  <Thermometer className={cn('w-5 h-5', tempOk ? 'text-green-600' : 'text-red-600')} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">当前温度</p>
                  <p className={cn('font-medium', tempOk ? 'text-green-700' : 'text-red-700')}>
                    {sample.currentTemp}℃
                    {!tempOk && <span className="text-xs ml-1">（异常）</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', daysToExpiry > 7 ? 'bg-green-100' : daysToExpiry > 0 ? 'bg-amber-100' : 'bg-red-100')}>
                  <Calendar className={cn('w-5 h-5', daysToExpiry > 7 ? 'text-green-600' : daysToExpiry > 0 ? 'text-amber-600' : 'text-red-600')} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">有效期</p>
                  <p className={cn('font-medium', daysToExpiry > 7 ? 'text-gray-900' : daysToExpiry > 0 ? 'text-amber-700' : 'text-red-700')}>
                    {sample.expiryDate}
                    {daysToExpiry > 0 ? `（剩余${daysToExpiry}天）` : '（已过期）'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', sample.hazardLevel >= 4 ? 'bg-red-100' : sample.hazardLevel >= 3 ? 'bg-amber-100' : 'bg-green-100')}>
                  <AlertTriangle className={cn('w-5 h-5', sample.hazardLevel >= 4 ? 'text-red-600' : sample.hazardLevel >= 3 ? 'text-amber-600' : 'text-green-600')} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">危险等级</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((l) => (
                        <div key={l} className={cn('w-3 h-3 rounded-full', l <= sample.hazardLevel ? HAZARD_COLORS[l] : 'bg-gray-200')} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{HAZARD_LABELS[sample.hazardLevel]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">库存信息</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Package className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">库存量</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sample.remainingQuantity}
                    <span className="text-sm font-normal text-gray-500"> / {sample.totalQuantity}</span>
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">库存占比 {pct.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">流转时间线</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1" />
                  <div className="w-0.5 h-full bg-gray-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-800">入库登记</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(sample.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              {sampleCheckouts.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-800">领用出库</p>
                    <p className="text-xs text-gray-500">{c.studentName} · {c.className} · {c.quantity}份</p>
                    <p className="text-xs text-gray-400">{new Date(c.checkoutTime).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              ))}

              {sampleReturns.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-3 h-3 rounded-full mt-1', r.type === 'return' ? 'bg-green-500' : 'bg-red-500')} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.type === 'return' ? '归还入库' : '废弃处理'}</p>
                    <p className="text-xs text-gray-500">{r.returnPerson} · {r.type === 'return' ? `剩余${r.remainingQuantity}份` : r.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(r.returnTime).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

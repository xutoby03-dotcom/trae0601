import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, Star, TrendingDown, TrendingUp, X, AlertTriangle } from 'lucide-react'
import type { ChannelType, DisposalMethod } from '@/types'
import { CHANNEL_TYPES, DISPOSAL_METHODS } from '@/types'
import { usePhoneStore } from '@/store'
import { calculateValuation, GROUP_LABELS, GROUP_COLORS } from '@/utils/valuation'

function getMissingFields(phone: { model: string; capacity: string | null; purchaseYear: number | null; batteryHealth: number | null }): string[] {
  const missing: string[] = []
  if (!phone.model) missing.push('型号')
  if (!phone.capacity) missing.push('容量')
  if (!phone.purchaseYear) missing.push('购入年份')
  if (phone.batteryHealth === null) missing.push('电池健康度')
  return missing
}

export default function PhoneDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { phones, quotes, transactions, deletePhone, addQuote, deleteQuote, addTransaction } = usePhoneStore()

  const phone = phones.find((p) => p.id === id)
  const phoneQuotes = quotes.filter((q) => q.phoneId === id)
  const phoneTx = transactions.find((t) => t.phoneId === id)

  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteForm, setQuoteForm] = useState({ platformName: '', channelType: 'door-to-door' as ChannelType, quote: '', note: '' })

  const [showTxForm, setShowTxForm] = useState(false)
  const [txForm, setTxForm] = useState({ finalPrice: '', platform: '', disposalMethod: 'recycle' as DisposalMethod, note: '' })

  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1B4332' }}>
        <p className="text-white">未找到手机信息</p>
      </div>
    )
  }

  const valuation = calculateValuation(phone)
  const missingFields = getMissingFields(phone)

  const groupedQuotes = CHANNEL_TYPES.map((ct) => ({
    ...ct,
    items: phoneQuotes.filter((q) => q.channelType === ct.value),
  })).filter((g) => g.items.length > 0)

  const maxQuote = phoneQuotes.length > 0 ? Math.max(...phoneQuotes.map((q) => q.quote)) : 0

  const handleAddQuote = () => {
    if (!quoteForm.platformName || !quoteForm.quote) return
    addQuote({ phoneId: id!, platformName: quoteForm.platformName, channelType: quoteForm.channelType, quote: Number(quoteForm.quote), note: quoteForm.note })
    setQuoteForm({ platformName: '', channelType: 'door-to-door', quote: '', note: '' })
    setShowQuoteForm(false)
  }

  const handleAddTx = () => {
    if (!txForm.finalPrice) return
    addTransaction({ phoneId: id!, finalPrice: Number(txForm.finalPrice), platform: txForm.platform, disposalMethod: txForm.disposalMethod, note: txForm.note })
    setTxForm({ finalPrice: '', platform: '', disposalMethod: 'recycle', note: '' })
    setShowTxForm(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deletePhone(id!)
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#f0f5f1' }}>
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 text-white" style={{ background: '#1B4332' }}>
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-semibold truncate mx-4">{phone.brand} {phone.model}</h1>
        <button onClick={() => navigate(`/phone/${id}/edit`)}><Pencil size={20} /></button>
      </header>

      <div className="px-4 space-y-4 mt-4">
        <section className="rounded-2xl p-5 text-white" style={{ background: '#1B4332' }}>
          <div className="text-center">
            <p className="text-sm opacity-80 mb-1">估值区间</p>
            <p className="text-3xl font-bold" style={{ color: '#F77F00' }}>
              ¥{valuation.estimatedMin} ~ ¥{valuation.estimatedMax}
            </p>
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: GROUP_COLORS[valuation.group], color: '#fff' }}
            >
              {GROUP_LABELS[valuation.group]}
            </span>
          </div>

          {valuation.deductions.length > 0 && (
            <div className="mt-4 space-y-1">
              {valuation.deductions.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><TrendingDown size={14} className="text-red-400" />{d.label}</span>
                  <span className="text-red-400">-¥{d.amount}</span>
                </div>
              ))}
            </div>
          )}

          {valuation.additions.length > 0 && (
            <div className="mt-3 space-y-1">
              {valuation.additions.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><TrendingUp size={14} className="text-green-300" />{a.label}</span>
                  <span className="text-green-300">+¥{a.amount}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {missingFields.length > 0 && (
          <button
            onClick={() => navigate(`/phone/${id}/edit`)}
            className="flex w-full items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-left"
            style={{ borderLeft: '4px solid #F59E0B' }}
          >
            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
            <span className="flex-1 text-sm text-amber-800">
              缺少 <span className="font-medium">{missingFields.join('、')}</span>，补充后估价更准确
            </span>
            <span className="shrink-0 text-xs font-medium text-amber-600 underline">去补充</span>
          </button>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: '#1B4332' }}>平台报价对比</h2>
            <button onClick={() => setShowQuoteForm(true)} className="flex items-center gap-1 text-sm" style={{ color: '#52B788' }}>
              <Plus size={16} />添加
            </button>
          </div>

          {phoneQuotes.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">暂无报价</p>
          ) : (
            <div className="space-y-3">
              {groupedQuotes.map((group) => (
                <div key={group.value}>
                  <p className="text-xs text-gray-400 mb-1">{group.label}</p>
                  {group.items.map((q) => {
                    const isHighest = q.quote === maxQuote && phoneQuotes.length > 1
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg mb-1"
                        style={{ background: isHighest ? 'rgba(247,127,0,0.12)' : '#f7faf8' }}
                      >
                        <div className="flex items-center gap-2">
                          {isHighest && <Star size={14} style={{ color: '#F77F00' }} fill="#F77F00" />}
                          <span className="text-sm font-medium">{q.platformName}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#e8f5ee', color: '#52B788' }}>
                            {CHANNEL_TYPES.find((c) => c.value === q.channelType)?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: isHighest ? '#F77F00' : '#1B4332' }}>¥{q.quote}</span>
                          <button onClick={() => deleteQuote(q.id)}><Trash2 size={14} className="text-gray-300" /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {showQuoteForm && (
            <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: '#52B788' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#1B4332' }}>添加报价</span>
                <button onClick={() => setShowQuoteForm(false)}><X size={16} className="text-gray-400" /></button>
              </div>
              <input placeholder="平台名称" value={quoteForm.platformName} onChange={(e) => setQuoteForm({ ...quoteForm, platformName: e.target.value })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#d1d5db' }} />
              <select value={quoteForm.channelType} onChange={(e) => setQuoteForm({ ...quoteForm, channelType: e.target.value as ChannelType })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#d1d5db' }}>
                {CHANNEL_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input placeholder="报价金额" type="number" value={quoteForm.quote} onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#d1d5db' }} />
              <textarea placeholder="备注（可选）" value={quoteForm.note} onChange={(e) => setQuoteForm({ ...quoteForm, note: e.target.value })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none resize-none" rows={2} style={{ borderColor: '#d1d5db' }} />
              <button onClick={handleAddQuote} className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#52B788' }}>确认添加</button>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1B4332' }}>成交记录</h2>

          {!phoneTx && !showTxForm && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-2">暂无成交记录</p>
              <button onClick={() => setShowTxForm(true)} className="inline-flex items-center gap-1 text-sm px-4 py-1.5 rounded-lg text-white" style={{ background: '#52B788' }}>
                <Plus size={14} />添加成交
              </button>
            </div>
          )}

          {phoneTx && (
            <div className="p-3 rounded-xl" style={{ background: '#f7faf8' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold" style={{ color: '#F77F00' }}>¥{phoneTx.finalPrice}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#e8f5ee', color: '#52B788' }}>
                  {DISPOSAL_METHODS.find((d) => d.value === phoneTx.disposalMethod)?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{phoneTx.platform}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(phoneTx.transactedAt).toLocaleDateString('zh-CN')}</p>
              {phoneTx.note && <p className="text-xs text-gray-400 mt-1">{phoneTx.note}</p>}
            </div>
          )}

          {showTxForm && (
            <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: '#52B788' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#1B4332' }}>添加成交</span>
                <button onClick={() => setShowTxForm(false)}><X size={16} className="text-gray-400" /></button>
              </div>
              <input placeholder="成交价格" type="number" value={txForm.finalPrice} onChange={(e) => setTxForm({ ...txForm, finalPrice: e.target.value })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#d1d5db' }} />
              <input placeholder="交易平台" value={txForm.platform} onChange={(e) => setTxForm({ ...txForm, platform: e.target.value })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#d1d5db' }} />
              <select value={txForm.disposalMethod} onChange={(e) => setTxForm({ ...txForm, disposalMethod: e.target.value as DisposalMethod })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#d1d5db' }}>
                {DISPOSAL_METHODS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <textarea placeholder="备注（可选）" value={txForm.note} onChange={(e) => setTxForm({ ...txForm, note: e.target.value })} className="w-full mb-2 px-3 py-2 rounded-lg border text-sm outline-none resize-none" rows={2} style={{ borderColor: '#d1d5db' }} />
              <button onClick={handleAddTx} className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#52B788' }}>确认添加</button>
            </div>
          )}
        </section>

        <button onClick={handleDelete} className="w-full py-3 rounded-xl text-center text-sm font-medium" style={{ color: confirmDelete ? '#fff' : '#E63946', background: confirmDelete ? '#E63946' : 'transparent', border: confirmDelete ? 'none' : '1px solid #E63946' }}>
          {confirmDelete ? '确认删除' : '删除此手机'}
        </button>
      </div>
    </div>
  )
}

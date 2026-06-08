import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, Calendar, MessageSquare, Receipt, Clock, Camera, Plus, Trash2, Wrench, User, Star, ImagePlus, X } from 'lucide-react'
import { STATUS_CONFIG, URGENCY_CONFIG, COST_CATEGORY_CONFIG, CONTACT_TYPE_CONFIG } from '@/types'
import type { OrderStatus, CostCategory } from '@/types'
import { useRepairStore } from '@/store/repairStore'
import PageHeader from '@/components/PageHeader'
import StarRating from '@/components/StarRating'
import { getRoomName, getRoomIcon, formatCurrency, formatDateTime } from '@/utils/format'

const STATUS_FLOW: OrderStatus[] = ['pending', 'scheduled', 'in_progress', 'completed']

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const store = useRepairStore()
  const { orders, contacts, addCommunication, addQuotation, addVisit, addCost, removeCost, setOrderRating, updateOrderStatus, updateOrder, updateContact } = store

  const order = orders.find((o) => o.id === id)
  const contact = order?.contactId ? contacts.find((c) => c.id === order.contactId) : null

  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  const [msgContent, setMsgContent] = useState('')
  const [msgDir, setMsgDir] = useState<'outgoing' | 'incoming'>('outgoing')
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteBy, setQuoteBy] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteNote, setQuoteNote] = useState('')
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitScheduled, setVisitScheduled] = useState('')
  const [visitNote, setVisitNote] = useState('')
  const [showCostForm, setShowCostForm] = useState(false)
  const [costCat, setCostCat] = useState<CostCategory>('labor')
  const [costAmount, setCostAmount] = useState('')
  const [costNote, setCostNote] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  if (!order) return <div className="p-8 text-center text-dark-700/60">工单未找到</div>

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null
  const totalCost = order.costs.reduce((s, c) => s + c.amount, 0)
  const urgency = URGENCY_CONFIG[order.urgency]

  const handleAddMsg = () => {
    if (!msgContent.trim()) return
    addCommunication(order.id, { content: msgContent.trim(), direction: msgDir })
    setMsgContent('')
  }

  const handleAddQuote = () => {
    if (!quoteBy.trim() || !quoteAmount) return
    addQuotation(order.id, { quotationBy: quoteBy.trim(), amount: Number(quoteAmount), note: quoteNote.trim() })
    setQuoteBy(''); setQuoteAmount(''); setQuoteNote(''); setShowQuoteForm(false)
  }

  const handleAddVisit = () => {
    if (!visitScheduled) return
    addVisit(order.id, { scheduledTime: visitScheduled, actualTime: '', note: visitNote.trim() })
    setVisitScheduled(''); setVisitNote(''); setShowVisitForm(false)
  }

  const handleAddCost = () => {
    if (!costAmount) return
    addCost(order.id, { category: costCat, amount: Number(costAmount), note: costNote.trim() })
    setCostAmount(''); setCostNote(''); setShowCostForm(false)
  }

  const handlePhotoUpload = async (type: 'beforePhotos' | 'afterPhotos', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const results = await Promise.all(Array.from(files).map(fileToBase64))
    updateOrder(order.id, { [type]: [...order[type], ...results] })
    if (e.target) e.target.value = ''
  }

  const removePhoto = (type: 'beforePhotos' | 'afterPhotos', idx: number) => {
    const updated = order[type].filter((_, i) => i !== idx)
    updateOrder(order.id, { [type]: updated })
  }

  const handleAddTag = () => {
    if (!tagInput.trim() || !contact) return
    const newTags = [...contact.tags, tagInput.trim()]
    updateContact(contact.id, { tags: newTags })
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    if (!contact) return
    updateContact(contact.id, { tags: contact.tags.filter((t) => t !== tag) })
  }

  const renderPhotoGrid = (type: 'beforePhotos' | 'afterPhotos', label: string) => {
    const photos = order[type]
    const inputRef = type === 'beforePhotos' ? beforeInputRef : afterInputRef
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-dark-700/60 font-medium">{label}</span>
          <button onClick={() => inputRef.current?.click()} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
            <ImagePlus className="w-3 h-3" />添加
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(type, e)} />
        </div>
        {photos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {photos.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-surface-200 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(type, i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-dark-700/30 py-3 text-center border border-dashed border-surface-200 rounded-lg">暂无照片</div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader showBack title={order.title} action={
        nextStatus ? (
          <button onClick={() => updateOrderStatus(order.id, nextStatus)} className="px-4 py-1.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-button">
            标记为{STATUS_CONFIG[nextStatus].label}
          </button>
        ) : null
      } />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-4 border border-surface-200 shadow-sm">
          {STATUS_FLOW.map((s, i) => {
            const cfg = STATUS_CONFIG[s]
            const done = i <= currentIdx
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-brand-500 text-white' : 'bg-surface-100 text-dark-700/40'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-[11px] mt-1 ${done ? 'text-brand-600 font-medium' : 'text-dark-700/40'}`}>{cfg.label}</span>
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`h-0.5 flex-1 rounded ${i < currentIdx ? 'bg-brand-500' : 'bg-surface-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-5">
          <div className="flex-[2] space-y-5">
            <section className="bg-white rounded-xl border border-surface-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-dark-900"><Camera className="w-4 h-4 text-brand-500" />维修照片</div>
              </div>
              <div className="p-4 space-y-4">
                {renderPhotoGrid('beforePhotos', '维修前')}
                {renderPhotoGrid('afterPhotos', '维修后')}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-surface-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-dark-900"><MessageSquare className="w-4 h-4 text-brand-500" />沟通记录</div>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {order.communications.length === 0 && <p className="text-xs text-dark-700/40 text-center py-4">暂无沟通记录</p>}
                {order.communications.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${c.direction === 'outgoing' ? 'items-end' : 'items-start'}`}>
                    <span className={`inline-block px-3 py-1.5 rounded-xl text-sm max-w-[80%] ${c.direction === 'outgoing' ? 'bg-brand-500 text-white' : 'bg-surface-100 text-dark-900'}`}>{c.content}</span>
                    <span className="text-[10px] text-dark-700/40 mt-0.5">{formatDateTime(c.createdAt)}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-100">
                <select value={msgDir} onChange={(e) => setMsgDir(e.target.value as 'outgoing' | 'incoming')} className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-surface-50">
                  <option value="outgoing">发出</option><option value="incoming">收到</option>
                </select>
                <input value={msgContent} onChange={(e) => setMsgContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMsg()}
                  placeholder="输入消息..." className="flex-1 text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-surface-50 focus:outline-none focus:ring-1 focus:ring-brand-400" />
                <button onClick={handleAddMsg} className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-surface-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-dark-900"><Receipt className="w-4 h-4 text-brand-500" />报价记录</div>
                <button onClick={() => setShowQuoteForm(!showQuoteForm)} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1"><Plus className="w-3 h-3" />添加</button>
              </div>
              <div className="p-4 space-y-2">
                {order.quotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                    <div><p className="text-sm font-medium text-dark-900">{q.quotationBy}</p><p className="text-xs text-dark-700/50">{q.note}</p></div>
                    <span className="text-sm font-bold text-brand-600">{formatCurrency(q.amount)}</span>
                  </div>
                ))}
                {showQuoteForm && (
                  <div className="p-3 bg-brand-50/50 rounded-lg space-y-2 border border-brand-100">
                    <input value={quoteBy} onChange={(e) => setQuoteBy(e.target.value)} placeholder="报价人" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                    <input value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="金额" type="number" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                    <input value={quoteNote} onChange={(e) => setQuoteNote(e.target.value)} placeholder="备注" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                    <div className="flex gap-2"><button onClick={handleAddQuote} className="px-3 py-1 bg-brand-500 text-white text-xs rounded-lg">确定</button><button onClick={() => setShowQuoteForm(false)} className="px-3 py-1 text-xs text-dark-700/60 hover:text-dark-900">取消</button></div>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-surface-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-dark-900"><Clock className="w-4 h-4 text-brand-500" />上门记录</div>
                <button onClick={() => setShowVisitForm(!showVisitForm)} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1"><Plus className="w-3 h-3" />添加</button>
              </div>
              <div className="p-4 space-y-2">
                {order.visits.map((v) => (
                  <div key={v.id} className="p-3 bg-surface-50 rounded-lg">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-dark-700/40" />
                      <span className="text-dark-900">预约: {formatDateTime(v.scheduledTime)}</span>
                      {v.actualTime && <span className="text-emerald-600">实际: {formatDateTime(v.actualTime)}</span>}
                    </div>
                    {v.note && <p className="text-xs text-dark-700/50 mt-1 ml-6">{v.note}</p>}
                  </div>
                ))}
                {showVisitForm && (
                  <div className="p-3 bg-brand-50/50 rounded-lg space-y-2 border border-brand-100">
                    <input value={visitScheduled} onChange={(e) => setVisitScheduled(e.target.value)} type="datetime-local" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                    <input value={visitNote} onChange={(e) => setVisitNote(e.target.value)} placeholder="备注" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                    <div className="flex gap-2"><button onClick={handleAddVisit} className="px-3 py-1 bg-brand-500 text-white text-xs rounded-lg">确定</button><button onClick={() => setShowVisitForm(false)} className="px-3 py-1 text-xs text-dark-700/60 hover:text-dark-900">取消</button></div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-dark-900 flex items-center gap-2"><Wrench className="w-4 h-4 text-brand-500" />基本信息</h3>
              <div className="flex items-center gap-2"><span className="text-dark-700/50 text-xs">房间</span>{getRoomIcon(order.roomId)}<span className="text-sm text-dark-900">{getRoomName(order.roomId)}</span></div>
              <div className="flex items-center gap-2"><span className="text-dark-700/50 text-xs">紧急度</span><span className={`px-2 py-0.5 rounded text-xs font-medium ${urgency.color} ${urgency.bg}`}>{urgency.label}</span></div>
              <p className="text-sm text-dark-900/80">{order.description}</p>
              <div className="flex items-center gap-2"><span className="text-dark-700/50 text-xs">预估费用</span><span className="text-sm font-bold text-brand-600">{formatCurrency(order.estimatedCost)}</span></div>
            </div>

            {contact && (
              <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4 space-y-3">
                <h3 className="text-sm font-semibold text-dark-900 flex items-center gap-2"><User className="w-4 h-4 text-brand-500" />联系人</h3>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-dark-900">{contact.name}</span><span className="px-2 py-0.5 rounded text-xs font-medium bg-surface-100 text-dark-700">{CONTACT_TYPE_CONFIG[contact.type].label}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-dark-700/40" /><span className="text-sm text-dark-900">{contact.phone}</span></div>
                <div className="flex items-center gap-2"><span className="text-dark-700/50 text-xs">评分</span><StarRating rating={contact.avgRating} size="sm" /><span className="text-[11px] text-dark-700/40">{contact.avgRating.toFixed(1)} · {contact.totalOrders}次</span></div>
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-dark-700/50 text-xs">标签</span>
                    <button onClick={() => setShowTagInput(!showTagInput)} className="text-[11px] text-brand-500 hover:text-brand-600">
                      {showTagInput ? '收起' : '编辑'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-brand-50 text-brand-600 rounded text-[11px] group">
                        {t}
                        {showTagInput && (
                          <button onClick={() => handleRemoveTag(t)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                            <X className="w-2.5 h-2.5 text-brand-400 hover:text-red-500" />
                          </button>
                        )}
                      </span>
                    ))}
                    {showTagInput && (
                      <div className="flex items-center gap-1">
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                          placeholder="新标签"
                          className="text-[11px] border border-surface-200 rounded px-1.5 py-0.5 w-16 focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                        <button onClick={handleAddTag} className="text-[11px] text-brand-500 hover:text-brand-600"><Plus className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dark-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-brand-500" />费用明细</h3>
                <button onClick={() => setShowCostForm(!showCostForm)} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1"><Plus className="w-3 h-3" />添加</button>
              </div>
              {order.costs.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-surface-100 rounded text-[11px] text-dark-700/60">{COST_CATEGORY_CONFIG[c.category].label}</span>
                    <span className="text-sm text-dark-900">{c.note || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-900">{formatCurrency(c.amount)}</span>
                    <button onClick={() => removeCost(order.id, c.id)} className="text-dark-700/30 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {order.costs.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                  <span className="text-sm font-medium text-dark-700/60">合计</span>
                  <span className="text-sm font-bold text-brand-600">{formatCurrency(totalCost)}</span>
                </div>
              )}
              {showCostForm && (
                <div className="p-3 bg-brand-50/50 rounded-lg space-y-2 border border-brand-100">
                  <select value={costCat} onChange={(e) => setCostCat(e.target.value as CostCategory)} className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white">
                    {Object.entries(COST_CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <input value={costAmount} onChange={(e) => setCostAmount(e.target.value)} placeholder="金额" type="number" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                  <input value={costNote} onChange={(e) => setCostNote(e.target.value)} placeholder="备注" className="w-full text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white" />
                  <div className="flex gap-2"><button onClick={handleAddCost} className="px-3 py-1 bg-brand-500 text-white text-xs rounded-lg">确定</button><button onClick={() => setShowCostForm(false)} className="px-3 py-1 text-xs text-dark-700/60 hover:text-dark-900">取消</button></div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-dark-900 flex items-center gap-2"><Star className="w-4 h-4 text-brand-500" />服务评分</h3>
              <StarRating rating={order.rating} onChange={(r) => setOrderRating(order.id, r)} />
              {order.rating > 0 && <p className="text-xs text-dark-700/50">已评 {order.rating} 星</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

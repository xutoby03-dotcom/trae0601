import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import { PRODUCT_TYPES } from '@/lib/constants'
import type { ProductType } from '../../shared/types'
import {
  MapPin, Calendar, Clock, Users, ArrowRight,
  Sparkles, Zap, Table, Armchair, Flame, User, Phone,
  Send, AlertCircle, Search
} from 'lucide-react'

export default function ApplyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preExId = params.get('exhibition') ? Number(params.get('exhibition')) : 0
  const preBoothId = params.get('booth') ? Number(params.get('booth')) : 0

  const { exhibitions, booths, fetchBooths, submitApplication, currentExhibitionId, setCurrentExhibition, addAlert } = useApp()

  const publishedEx = useMemo(() => exhibitions.filter(e => e.status === 'published' || e.status === 'ongoing'), [exhibitions])
  const [selectedEx, setSelectedEx] = useState<number>(preExId || 0)
  const [selectedBooth, setSelectedBooth] = useState<number>(preBoothId || 0)

  useEffect(() => {
    const target = selectedEx || currentExhibitionId
    if (target) {
      if (!selectedEx) setSelectedEx(target)
      fetchBooths(target)
    }
  }, [selectedEx, currentExhibitionId])

  const selectedExData = publishedEx.find(e => e.id === selectedEx) || exhibitions.find(e => e.id === selectedEx)
  const availableBooths = useMemo(() => booths.filter(b => b.type === 'booth' && b.status === 'available'), [booths])

  const [form, setForm] = useState({
    vendor_name: '',
    brand: '',
    product_type: '手工艺品' as ProductType,
    power_watts: 500,
    tables: 1,
    chairs: 2,
    has_open_flame: false,
    contact_name: '',
    contact_phone: '',
  })

  const handleSelectEx = (id: number) => {
    setSelectedEx(id)
    setSelectedBooth(0)
    setCurrentExhibition(id)
  }

  const handleSubmit = async () => {
    if (!selectedEx) { addAlert('error', '请选择展会'); return }
    if (!selectedBooth) { addAlert('error', '请选择摊位'); return }
    if (!form.vendor_name || !form.brand || !form.contact_name || !form.contact_phone) {
      addAlert('error', '请完整填写必填项')
      return
    }
    try {
      await submitApplication({
        exhibition_id: selectedEx,
        booth_id: selectedBooth,
        ...form,
      })
      setForm({ vendor_name: '', brand: '', product_type: '手工艺品', power_watts: 500, tables: 1, chairs: 2, has_open_flame: false, contact_name: '', contact_phone: '' })
      setSelectedBooth(0)
    } catch {}
  }

  return (
    <>
      <PageHeader title="申请摊位" subtitle="浏览正在招募的展会，挑选心仪摊位，一键提交申请" />

      <section className="flex-1 overflow-y-auto">
        <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div>
              <h2 className="section-title mb-4">
                <Calendar className="w-4 h-4 text-copper-500" />
                正在招募的展会
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publishedEx.length === 0 ? (
                  <div className="col-span-full card p-10 text-center text-forest-400">
                    目前暂无可申请的展会，请等待管理员发布
                  </div>
                ) : publishedEx.map(ex => {
                  const active = selectedEx === ex.id
                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectEx(ex.id)}
                      className={cn(
                        'text-left p-5 rounded-2xl border-2 transition-all',
                        active ? 'bg-gradient-to-br from-forest-50 to-white border-copper-400 shadow-copper' : 'card hover:shadow-lift border-transparent'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="title-md">{ex.name}</h3>
                        </div>
                        <span className={cn('badge',
                          ex.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')}
                        >{ex.status === 'ongoing' ? '进行中' : '招募中'}</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-forest-600">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-copper-500" />{ex.venue}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-copper-500" />{ex.start_date} 至 {ex.end_date}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-copper-500" />{ex.open_time} - {ex.close_time}</div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-copper-500" />
                          剩余空位 {Math.max(0, (ex.total || 0) - (ex.occupied || 0))} / {ex.total || ex.booth_count}
                        </div>
                      </div>
                      {ex.setup_rules && (
                        <div className="mt-3 p-2.5 rounded-xl bg-forest-50/60 text-[11px] text-forest-600 leading-relaxed">
                          <AlertCircle className="w-3.5 h-3.5 inline align-sub mr-1 text-copper-500" />
                          {ex.setup_rules.length > 120 ? ex.setup_rules.slice(0, 120) + '...' : ex.setup_rules}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedExData && (
              <div className="animate-slide-right">
                <h2 className="section-title mb-4">
                  <Sparkles className="w-4 h-4 text-copper-500" />
                  选择摊位 <span className="ml-1 badge bg-copper-100 text-copper-700">{selectedBooth ? availableBooths.find(b => b.id === selectedBooth)?.booth_number || '' : '未选择'}</span>
                </h2>
                <div className="card p-5">
                  {availableBooths.length === 0 ? (
                    <div className="py-8 text-center text-forest-400 text-sm">该展会暂无空闲摊位</div>
                  ) : (
                    <div className="grid grid-cols-5 md:grid-cols-8 gap-2.5">
                      {availableBooths.map(b => {
                        const sel = selectedBooth === b.id
                        return (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBooth(b.id)}
                            className={cn(
                              'aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center text-center p-2 transition-all',
                              sel ? 'bg-copper-500 border-copper-500 text-white shadow-copper scale-105' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-copper-400 hover:bg-white'
                            )}
                          >
                            <span className="font-serif font-semibold text-sm">{b.booth_number}</span>
                            <span className={cn('text-[10px] mt-0.5 opacity-75', sel ? '' : 'text-emerald-600')}>
                              {b.zone} 区
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card p-6 sticky top-8 animate-slide-up">
              <h2 className="section-title mb-5">
                <Sparkles className="w-4 h-4 text-copper-500" />
                填写申请信息
              </h2>
              <div className="space-y-4">
                <FormGroup>
                  <Label>摊主/公司名 *</Label>
                  <input className="input-base" value={form.vendor_name} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} placeholder="如：蓝染工坊" />
                </FormGroup>
                <FormGroup>
                  <Label>品牌名称 *</Label>
                  <input className="input-base" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="如：蓝·印" />
                </FormGroup>
                <FormGroup>
                  <Label>商品类型 *</Label>
                  <select className="input-base" value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value as ProductType }))}>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormGroup>

                <div className="grid grid-cols-3 gap-3">
                  <FormGroup>
                    <Label><Zap className="w-3.5 h-3.5 inline mr-1 text-yellow-500" />用电 (W)</Label>
                    <input type="number" min={0} className="input-base" value={form.power_watts} onChange={e => setForm(f => ({ ...f, power_watts: +e.target.value }))} />
                  </FormGroup>
                  <FormGroup>
                    <Label><Table className="w-3.5 h-3.5 inline mr-1" />桌子</Label>
                    <input type="number" min={0} className="input-base" value={form.tables} onChange={e => setForm(f => ({ ...f, tables: +e.target.value }))} />
                  </FormGroup>
                  <FormGroup>
                    <Label><Armchair className="w-3.5 h-3.5 inline mr-1" />椅子</Label>
                    <input type="number" min={0} className="input-base" value={form.chairs} onChange={e => setForm(f => ({ ...f, chairs: +e.target.value }))} />
                  </FormGroup>
                </div>

                <FormGroup>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.has_open_flame}
                      onChange={e => setForm(f => ({ ...f, has_open_flame: e.target.checked }))}
                      className="w-4 h-4 rounded accent-copper-500"
                    />
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-forest-700">有明火（煎烤、蜡烛等）</span>
                  </label>
                </FormGroup>

                <div className="pt-3 border-t border-forest-100/60 space-y-4">
                  <FormGroup>
                    <Label><User className="w-3.5 h-3.5 inline mr-1 text-copper-500" />负责人 *</Label>
                    <input className="input-base" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="姓名" />
                  </FormGroup>
                  <FormGroup>
                    <Label><Phone className="w-3.5 h-3.5 inline mr-1 text-copper-500" />联系电话 *</Label>
                    <input className="input-base" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="11 位手机号" />
                  </FormGroup>
                </div>

                <button onClick={handleSubmit} className="btn-primary w-full mt-4">
                  <Send className="w-4 h-4" />
                  提交申请
                </button>
                <div className="text-[11px] text-forest-400 text-center leading-relaxed">
                  提交后管理员会审核，结果会通过系统消息通知，请留意「我的申请」
                </div>
              </div>
            </div>

            <div className="text-xs text-forest-400 text-center">
              已申请摊主可前往「我的申请」查看状态
              <button onClick={() => navigate('/apply/my')} className="ml-1 text-copper-600 font-medium hover:underline inline-flex items-center gap-0.5">
                查看 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

function FormGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>
}

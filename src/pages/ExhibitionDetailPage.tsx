import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import {
  Save, ArrowLeft, Plus, Grid3X3, FileText, AlertTriangle,
  Edit, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Booth } from '../../shared/types'

export default function ExhibitionDetailPage({ create = false }: { create?: boolean }) {
  const navigate = useNavigate()
  const params = useParams()
  const id = params.id ? Number(params.id) : 0
  const { currentExhibition, currentExhibitionId, createExhibition, updateExhibition, booths, fetchBooths, setCurrentExhibition } = useApp()

  const [step, setStep] = useState<'info' | 'layout' | 'rules'>(create ? 'info' : 'info')
  const [form, setForm] = useState({
    name: '',
    venue: '',
    start_date: '',
    end_date: '',
    booth_count: 20,
    open_time: '09:00',
    close_time: '18:00',
    setup_rules: '',
    status: 'draft',
    grid_rows: 5,
    grid_cols: 8,
  })

  useEffect(() => {
    if (create) return
    if (currentExhibition && currentExhibition.id === id) {
      setForm({
        name: currentExhibition.name,
        venue: currentExhibition.venue,
        start_date: currentExhibition.start_date,
        end_date: currentExhibition.end_date,
        booth_count: currentExhibition.booth_count,
        open_time: currentExhibition.open_time,
        close_time: currentExhibition.close_time,
        setup_rules: currentExhibition.setup_rules,
        status: currentExhibition.status,
        grid_rows: currentExhibition.grid_rows,
        grid_cols: currentExhibition.grid_cols,
      })
    } else if (id) {
      setCurrentExhibition(id)
    }
  }, [create, currentExhibition, id])

  useEffect(() => {
    if (id) fetchBooths(id)
  }, [id])

  const [layout, setLayout] = useState<Booth[]>(booths)

  useEffect(() => {
    if (booths.length) setLayout(booths)
  }, [booths])

  const updateField = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    try {
      if (create) {
        const newId = await createExhibition(form)
        navigate(`/exhibitions/${newId}`)
      } else {
        await updateExhibition(id, form)
        navigate('/exhibitions')
      }
    } catch {}
  }

  const steps = [
    { key: 'info', label: '基本信息', icon: FileText },
    { key: 'layout', label: '摊位布局', icon: Grid3X3, disabled: create },
    { key: 'rules', label: '布展规则', icon: AlertTriangle, disabled: create },
  ]

  const toggleBoothType = (b: Booth) => {
    setLayout(prev => {
      const next = [...prev]
      const idx = next.findIndex(x => x.id === b.id)
      if (idx < 0) return prev
      const types: Booth['type'][] = ['booth', 'aisle', 'empty']
      const i = types.indexOf(next[idx].type)
      next[idx] = { ...next[idx], type: types[(i + 1) % types.length], status: types[(i + 1) % types.length] === 'booth' ? next[idx].status : 'available' }
      return next
    })
  }

  const saveLayout = async () => {
    try {
      await fetch(`/api/exhibitions/${id}/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout),
      })
      useApp.getState().addAlert('success', '布局已保存')
      fetchBooths(id)
    } catch {}
  }

  return (
    <>
      <PageHeader
        title={create ? '创建展会' : `编辑 · ${currentExhibition?.name || ''}`}
        subtitle={create ? '填写展会基本信息，一键创建全新展会' : '修改展会信息、摊位布局与布展规则'}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="btn-outline">
              <ArrowLeft className="w-4 h-4" />返回
            </button>
            {step === 'info' && (
              <button onClick={handleSubmit} className="btn-primary">
                <Save className="w-4 h-4" />{create ? '创建展会' : '保存修改'}
              </button>
            )}
          </div>
        }
      />

      <section className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-8 overflow-x-auto">
            {steps.map((s, idx) => {
              const active = step === s.key
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  onClick={() => !s.disabled && setStep(s.key as any)}
                  disabled={s.disabled}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
                    active ? 'bg-forest-700 text-white shadow-soft' : s.disabled ? 'opacity-40 cursor-not-allowed bg-forest-50 text-forest-500' : 'bg-white border border-forest-200 text-forest-700 hover:border-forest-400'
                  )}
                >
                  <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-forest-100 text-forest-700')}
                  >{idx + 1}</span>
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              )
            })}
          </div>

          {step === 'info' && (
            <div className="card p-7 max-w-3xl animate-fade-in">
              <h3 className="title-lg mb-6">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="展会名称" required>
                  <input
                    className="input-base"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="如：2026 春日创意市集"
                  />
                </Field>
                <Field label="场地地址" required>
                  <input
                    className="input-base"
                    value={form.venue}
                    onChange={e => updateField('venue', e.target.value)}
                    placeholder="如：万象城中央广场"
                  />
                </Field>
                <Field label="开始日期" required>
                  <input type="date" className="input-base" value={form.start_date} onChange={e => updateField('start_date', e.target.value)} />
                </Field>
                <Field label="结束日期" required>
                  <input type="date" className="input-base" value={form.end_date} onChange={e => updateField('end_date', e.target.value)} />
                </Field>
                <Field label="开放时间（开始）" required>
                  <input type="time" className="input-base" value={form.open_time} onChange={e => updateField('open_time', e.target.value)} />
                </Field>
                <Field label="开放时间（结束）" required>
                  <input type="time" className="input-base" value={form.close_time} onChange={e => updateField('close_time', e.target.value)} />
                </Field>
                <Field label="网格行数">
                  <input type="number" min={2} max={20} className="input-base" value={form.grid_rows} onChange={e => updateField('grid_rows', +e.target.value)} />
                </Field>
                <Field label="网格列数">
                  <input type="number" min={2} max={20} className="input-base" value={form.grid_cols} onChange={e => updateField('grid_cols', +e.target.value)} />
                </Field>
                <Field label="展会状态">
                  <select className="input-base" value={form.status} onChange={e => updateField('status', e.target.value)}>
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="ongoing">进行中</option>
                    <option value="ended">已结束</option>
                  </select>
                </Field>
              </div>
              <div className="mt-6 pt-6 border-t border-forest-100/60 flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="btn-outline">取消</button>
                <button onClick={handleSubmit} className="btn-primary ml-auto">
                  <Save className="w-4 h-4" />{create ? '创建展会' : '保存修改'}
                </button>
              </div>
            </div>
          )}

          {step === 'layout' && (
            <div className="card p-7 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="title-lg">摊位布局</h3>
                  <p className="text-sm text-forest-500 mt-1">点击格子切换「摊位 → 通道 → 空地」</p>
                </div>
                <button onClick={saveLayout} className="btn-primary">
                  <Save className="w-4 h-4" />保存布局
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg border bg-emerald-50 border-emerald-200" />
                  <span className="text-forest-600 font-medium">摊位</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg border bg-gradient-to-br from-zinc-100 to-zinc-200/60 border-zinc-200" />
                  <span className="text-forest-600 font-medium">通道</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg border-dashed border bg-forest-50/40 border-forest-200" />
                  <span className="text-forest-600 font-medium">空地</span>
                </div>
              </div>

              {layout.length === 0 ? (
                <div className="py-12 text-center text-forest-400 text-sm">请先保存基本信息后再编辑布局</div>
              ) : (
                <div
                  className="grid gap-3 mx-auto"
                  style={{ gridTemplateColumns: `repeat(${form.grid_cols}, minmax(0, 1fr))`, maxWidth: `${form.grid_cols * 110}px` }}
                >
                  {(() => {
                    const map = new Map<string, Booth>()
                    layout.forEach(b => map.set(`${b.row}-${b.col}`, b))
                    const arr = []
                    for (let r = 0; r < form.grid_rows; r++) {
                      for (let c = 0; c < form.grid_cols; c++) {
                        const b = map.get(`${r}-${c}`)
                        if (!b) { arr.push(<div key={`${r}-${c}`} />); continue }
                        const style = b.type === 'aisle'
                          ? 'bg-gradient-to-br from-zinc-100 to-zinc-200/60 border-zinc-200 text-zinc-400'
                          : b.type === 'empty'
                            ? 'bg-forest-50/40 border-dashed border-forest-200 text-forest-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        arr.push(
                          <button
                            key={b.id}
                            onClick={() => toggleBoothType(b)}
                            className={cn(
                              'aspect-[4/3] rounded-xl border flex flex-col items-center justify-center text-[11px] p-1.5 transition-all hover:shadow-soft',
                              style
                            )}
                          >
                            {b.type === 'aisle' ? (
                              <span className="tracking-widest uppercase text-[9px]">通道</span>
                            ) : b.type === 'empty' ? (
                              <span className="opacity-60">空地</span>
                            ) : (
                              <>
                                <span className="font-serif font-semibold text-sm">{b.booth_number}</span>
                                <span className="opacity-70">{b.status === 'available' ? '空位' : b.application?.brand || '已占用'}</span>
                              </>
                            )}
                          </button>
                        )
                      }
                    }
                    return arr
                  })()}
                </div>
              )}
            </div>
          )}

          {step === 'rules' && (
            <div className="card p-7 max-w-3xl animate-fade-in">
              <h3 className="title-lg mb-2">布展规则</h3>
              <p className="text-sm text-forest-500 mb-6">摊主在申请摊位前会看到这些规则，建议清晰说明时间要求、用电规范、安全须知等。</p>
              <textarea
                value={form.setup_rules}
                onChange={e => updateField('setup_rules', e.target.value)}
                className="input-base min-h-[240px] resize-y leading-relaxed"
                placeholder={"1. 布展时间 08:00-09:30 请勿迟到；\n2. 明火摊位需自备灭火器；\n3. 单摊位总用电负荷不超过 2000W；\n4. 保持主通道畅通，通道不小于 1.5 米；\n5. 展会结束后请清理摊位并恢复原样。"}
              />
              <div className="mt-6 pt-6 border-t border-forest-100/60 flex items-center justify-end gap-2">
                <button onClick={handleSubmit} className="btn-primary">
                  <Save className="w-4 h-4" />保存规则
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

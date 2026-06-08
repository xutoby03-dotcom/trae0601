import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, generateId } from '@/store'
import { DISEASE_TYPE_LABELS, DISEASE_TYPE_COLORS, COST_TYPE_LABELS } from '@/types'
import type { FollowUpRecord, CostType } from '@/types'
import { ClipboardPlus, Plus, Trash2, X, AlertTriangle, Activity } from 'lucide-react'

type ModalType = 'followUp' | 'indicator' | null

const defaultFU = { diseaseId: '', date: '', checkResults: '', doctorAdvice: '', nextDate: '', medicationAdjust: '', cost: 0, costType: 'medication' as CostType }
const defaultHI = { name: '', value: 0, unit: '', date: '' }

function isAbnormalValue(name: string, value: number): boolean {
  if (name.includes('收缩压')) return value > 140
  if (name.includes('舒张压')) return value > 90
  if (name.includes('血糖')) return value > 7.0
  return false
}

export default function FollowUp() {
  const { elderId } = useParams()
  const navigate = useNavigate()
  const { elders, chronicDiseases, followUpRecords, healthIndicators, addFollowUpRecord, addHealthIndicator, deleteFollowUpRecord, deleteHealthIndicator } = useStore()

  const [modal, setModal] = useState<ModalType>(null)
  const [fuForm, setFuForm] = useState(defaultFU)
  const [hiForm, setHiForm] = useState(defaultHI)

  const selectedElderId = elderId || (elders.length === 1 ? elders[0].id : '')
  const elderDiseases = chronicDiseases.filter((d) => d.elderId === selectedElderId)
  const diseaseMap = Object.fromEntries(chronicDiseases.map((d) => [d.id, d]))
  const elderRecords = followUpRecords.filter((r) => elderDiseases.some((d) => d.id === r.diseaseId)).sort((a, b) => b.date.localeCompare(a.date))
  const elderIndicators = healthIndicators.filter((h) => elderDiseases.some((d) => d.id === h.diseaseId)).sort((a, b) => b.date.localeCompare(a.date))

  const grouped = elderRecords.reduce<Record<string, FollowUpRecord[]>>((acc, r) => {
    const key = r.diseaseId
    acc[key] = acc[key] || []
    acc[key].push(r)
    return acc
  }, {})

  const handleAddFU = () => {
    if (!fuForm.diseaseId || !fuForm.date) return
    addFollowUpRecord({ id: generateId(), ...fuForm })
    setFuForm(defaultFU)
    setModal(null)
  }

  const handleAddHI = () => {
    if (!hiForm.name || !hiForm.date) return
    const diseaseId = elderDiseases.length === 1 ? elderDiseases[0].id : ''
    addHealthIndicator({ id: generateId(), diseaseId, ...hiForm, isAbnormal: isAbnormalValue(hiForm.name, hiForm.value) })
    setHiForm(defaultHI)
    setModal(null)
  }

  return (
    <div>
      {elders.length > 1 && (
        <select className="w-full mb-4 p-2 border rounded-lg text-sm" value={selectedElderId} onChange={(e) => navigate(`/followup/${e.target.value}`)}>
          <option value="">选择老人</option>
          {elders.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      )}

      {!selectedElderId ? (
        <p className="text-center text-gray-400 mt-20">请先选择一位老人</p>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setFuForm({ ...defaultFU, diseaseId: elderDiseases[0]?.id || '' }); setModal('followUp') }} className="flex items-center gap-1 px-4 py-2 bg-coral-500 text-white rounded-lg text-sm hover:bg-coral-600" style={{ backgroundColor: '#F87171' }}>
              <ClipboardPlus size={16} /> 添加复诊记录
            </button>
            <button onClick={() => { setHiForm(defaultHI); setModal('indicator') }} className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
              <Activity size={16} /> 添加健康指标
            </button>
          </div>

          {Object.entries(grouped).map(([diseaseId, records]) => {
            const disease = diseaseMap[diseaseId]
            if (!disease) return null
            return (
              <div key={diseaseId} className="mb-6">
                <h3 className="text-sm font-semibold mb-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs border ${DISEASE_TYPE_COLORS[disease.type]}`}>
                    {DISEASE_TYPE_LABELS[disease.type]}
                  </span>
                </h3>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-coral-300" style={{ backgroundColor: '#FCA5A5' }} />
                  {records.map((r) => (
                    <div key={r.id} className="relative mb-4">
                      <div className="absolute -left-4 top-2 w-3 h-3 rounded-full bg-coral-500 border-2 border-white shadow" style={{ backgroundColor: '#F87171' }} />
                      <div className="bg-[#FDF6EC] rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">{r.date}</span>
                          <button onClick={() => deleteFollowUpRecord(r.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                        {r.checkResults && <p className="text-sm mt-1"><span className="text-gray-500">检查结果：</span>{r.checkResults}</p>}
                        {r.doctorAdvice && <p className="text-sm mt-1"><span className="text-gray-500">医生建议：</span>{r.doctorAdvice}</p>}
                        {r.nextDate && <p className="text-sm mt-1"><span className="text-gray-500">下次复诊：</span>{r.nextDate}</p>}
                        {r.medicationAdjust && <p className="text-sm mt-1"><span className="text-gray-500">药量调整：</span>{r.medicationAdjust}</p>}
                        {r.cost > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium">¥{r.cost}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${r.costType === 'medication' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              {COST_TYPE_LABELS[r.costType]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {elderIndicators.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1"><Activity size={16} /> 健康指标</h3>
              <div className="space-y-2">
                {elderIndicators.map((h) => (
                  <div key={h.id} className={`flex items-center justify-between p-3 rounded-lg ${h.isAbnormal ? 'bg-[#FFF5F5]' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      {h.isAbnormal && <AlertTriangle size={16} className="text-red-500" />}
                      <span className={`text-sm font-medium ${h.isAbnormal ? 'text-red-600' : 'text-gray-700'}`}>{h.name}</span>
                      <span className={`text-sm ${h.isAbnormal ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{h.value} {h.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{h.date}</span>
                      <button onClick={() => deleteHealthIndicator(h.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">{modal === 'followUp' ? '添加复诊记录' : '添加健康指标'}</h3>
              <button onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {modal === 'followUp' ? (
                <>
                  <select className="w-full p-2 border rounded-lg text-sm" value={fuForm.diseaseId} onChange={(e) => setFuForm({ ...fuForm, diseaseId: e.target.value })}>
                    <option value="">选择慢病</option>
                    {elderDiseases.map((d) => <option key={d.id} value={d.id}>{DISEASE_TYPE_LABELS[d.type]}</option>)}
                  </select>
                  <input type="date" className="w-full p-2 border rounded-lg text-sm" value={fuForm.date} onChange={(e) => setFuForm({ ...fuForm, date: e.target.value })} placeholder="复诊日期" />
                  <textarea className="w-full p-2 border rounded-lg text-sm" rows={2} placeholder="检查结果" value={fuForm.checkResults} onChange={(e) => setFuForm({ ...fuForm, checkResults: e.target.value })} />
                  <textarea className="w-full p-2 border rounded-lg text-sm" rows={2} placeholder="医生建议" value={fuForm.doctorAdvice} onChange={(e) => setFuForm({ ...fuForm, doctorAdvice: e.target.value })} />
                  <input type="date" className="w-full p-2 border rounded-lg text-sm" value={fuForm.nextDate} onChange={(e) => setFuForm({ ...fuForm, nextDate: e.target.value })} placeholder="下次复诊时间" />
                  <textarea className="w-full p-2 border rounded-lg text-sm" rows={2} placeholder="药量调整" value={fuForm.medicationAdjust} onChange={(e) => setFuForm({ ...fuForm, medicationAdjust: e.target.value })} />
                  <div className="flex gap-2">
                    <input type="number" className="flex-1 p-2 border rounded-lg text-sm" placeholder="费用金额" value={fuForm.cost || ''} onChange={(e) => setFuForm({ ...fuForm, cost: Number(e.target.value) })} />
                    <select className="w-28 p-2 border rounded-lg text-sm" value={fuForm.costType} onChange={(e) => setFuForm({ ...fuForm, costType: e.target.value as CostType })}>
                      {Object.entries(COST_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <input className="w-full p-2 border rounded-lg text-sm" placeholder="指标名称（如 血压收缩压）" value={hiForm.name} onChange={(e) => setHiForm({ ...hiForm, name: e.target.value })} />
                  <div className="flex gap-2">
                    <input type="number" className="flex-1 p-2 border rounded-lg text-sm" placeholder="数值" value={hiForm.value || ''} onChange={(e) => setHiForm({ ...hiForm, value: Number(e.target.value) })} />
                    <input className="w-24 p-2 border rounded-lg text-sm" placeholder="单位" value={hiForm.unit} onChange={(e) => setHiForm({ ...hiForm, unit: e.target.value })} />
                  </div>
                  <input type="date" className="w-full p-2 border rounded-lg text-sm" value={hiForm.date} onChange={(e) => setHiForm({ ...hiForm, date: e.target.value })} />
                  <p className="text-xs text-gray-400">超阈值自动标记异常：收缩压&gt;140、舒张压&gt;90、空腹血糖&gt;7.0</p>
                </>
              )}
            </div>
            <div className="p-4 border-t">
              <button onClick={modal === 'followUp' ? handleAddFU : handleAddHI} className="w-full py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#F87171' }}>
                <Plus size={14} className="inline mr-1" />确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

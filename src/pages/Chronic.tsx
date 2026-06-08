import { useStore } from '@/store'
import { generateId } from '@/store'
import { DISEASE_TYPE_LABELS, DISEASE_TYPE_COLORS } from '@/types'
import type { ChronicDisease, Medication, CheckItem, DiseaseType } from '@/types'
import { HeartPulse, Pill, TestTube2, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BORDER_COLORS: Record<DiseaseType, string> = {
  hypertension: 'border-l-red-500',
  diabetes: 'border-l-amber-500',
  heartDisease: 'border-l-rose-500',
  other: 'border-l-slate-400',
}

type ModalType = 'disease' | 'medication' | 'checkItem' | null

const emptyDiseaseForm = (): ChronicDisease => ({
  id: '', elderId: '', type: 'hypertension',
  diagnosisDate: '', targetIndicator: '', followUpCycleDays: 30, precautions: '',
})

const emptyMedForm = (): Medication => ({
  id: '', diseaseId: '', name: '', dosage: '', frequency: '', startDate: '',
})

const emptyCheckForm = (): CheckItem => ({
  id: '', diseaseId: '', name: '', cycle: '',
})

export default function Chronic() {
  const { elderId: paramId } = useParams()
  const navigate = useNavigate()
  const { elders, chronicDiseases, medications, checkItems,
    addChronicDisease, addMedication, addCheckItem,
    deleteChronicDisease, deleteMedication, deleteCheckItem } = useStore()

  const selectedElderId = paramId
    ? (elders.find(e => e.id === paramId)?.id ?? elders[0]?.id ?? '')
    : (elders[0]?.id ?? '')

  const [activeTab, setActiveTab] = useState<DiseaseType | 'all'>('all')
  const [modalType, setModalType] = useState<ModalType>(null)
  const [targetDiseaseId, setTargetDiseaseId] = useState('')
  const [diseaseForm, setDiseaseForm] = useState(emptyDiseaseForm())
  const [medForm, setMedForm] = useState(emptyMedForm())
  const [checkForm, setCheckForm] = useState(emptyCheckForm())

  const elderDiseases = chronicDiseases.filter(d => d.elderId === selectedElderId)
  const filtered = activeTab === 'all' ? elderDiseases : elderDiseases.filter(d => d.type === activeTab)

  const openDiseaseModal = () => {
    setDiseaseForm({ ...emptyDiseaseForm(), elderId: selectedElderId })
    setModalType('disease')
  }

  const openMedModal = (diseaseId: string) => {
    setMedForm({ ...emptyMedForm(), diseaseId })
    setTargetDiseaseId(diseaseId)
    setModalType('medication')
  }

  const openCheckModal = (diseaseId: string) => {
    setCheckForm({ ...emptyCheckForm(), diseaseId })
    setTargetDiseaseId(diseaseId)
    setModalType('checkItem')
  }

  const handleAddDisease = () => {
    if (!diseaseForm.diagnosisDate) return
    addChronicDisease({ ...diseaseForm, id: generateId() })
    setModalType(null)
  }

  const handleAddMed = () => {
    if (!medForm.name || !medForm.dosage) return
    addMedication({ ...medForm, id: generateId(), diseaseId: targetDiseaseId })
    setModalType(null)
  }

  const handleAddCheck = () => {
    if (!checkForm.name) return
    addCheckItem({ ...checkForm, id: generateId(), diseaseId: targetDiseaseId })
    setModalType(null)
  }

  const tabs: (DiseaseType | 'all')[] = ['all', 'hypertension', 'diabetes', 'heartDisease', 'other']

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <HeartPulse size={22} className="text-coral-500" /> 慢病管理
        </h1>
        <button onClick={openDiseaseModal} className="flex items-center gap-1 px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 text-sm">
          <Plus size={16} /> 添加慢病
        </button>
      </div>

      {elders.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {elders.map(e => (
            <button key={e.id} onClick={() => navigate(`/chronic/${e.id}`)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedElderId === e.id ? 'bg-coral-500 text-white' : 'bg-white text-gray-600 hover:bg-coral-50'}`}>
              {e.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(tab => {
          const count = tab === 'all' ? elderDiseases.length : elderDiseases.filter(d => d.type === tab).length
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition ${activeTab === tab ? 'bg-coral-500 text-white' : 'bg-cream text-gray-600 hover:bg-coral-50'}`}>
              {tab === 'all' ? '全部' : DISEASE_TYPE_LABELS[tab]}
              {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-coral-100 text-coral-700'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {filtered.map(disease => {
          const meds = medications.filter(m => m.diseaseId === disease.id)
          const checks = checkItems.filter(c => c.diseaseId === disease.id)
          return (
            <div key={disease.id} className={`bg-white rounded-xl p-5 border-l-4 shadow-sm ${BORDER_COLORS[disease.type]}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded border ${DISEASE_TYPE_COLORS[disease.type]}`}>
                  {DISEASE_TYPE_LABELS[disease.type]}
                </span>
                <button onClick={() => deleteChronicDisease(disease.id)} className="text-gray-300 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 mb-4">
                <div>确诊日期：<span className="text-gray-800">{disease.diagnosisDate || '未填写'}</span></div>
                <div>目标指标：<span className="text-gray-800">{disease.targetIndicator || '未填写'}</span></div>
                <div>随访周期：<span className="text-gray-800">{disease.followUpCycleDays}天/次</span></div>
                <div>注意事项：<span className="text-gray-800">{disease.precautions || '无'}</span></div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><Pill size={14} className="text-coral-400" /> 用药列表</span>
                  <button onClick={() => openMedModal(disease.id)} className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-0.5"><Plus size={12} /> 添加用药</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meds.map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-coral-50 text-coral-700 rounded-full text-xs border border-coral-100">
                      {m.name} {m.dosage} · {m.frequency} · {m.startDate}
                      <button onClick={() => deleteMedication(m.id)} className="text-coral-300 hover:text-red-400"><X size={12} /></button>
                    </span>
                  ))}
                  {meds.length === 0 && <span className="text-xs text-gray-400">暂无用药</span>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><TestTube2 size={14} className="text-amber-500" /> 检查项目</span>
                  <button onClick={() => openCheckModal(disease.id)} className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-0.5"><Plus size={12} /> 添加检查项</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {checks.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-100">
                      {c.name} · {c.cycle}
                      <button onClick={() => deleteCheckItem(c.id)} className="text-amber-300 hover:text-red-400"><X size={12} /></button>
                    </span>
                  ))}
                  {checks.length === 0 && <span className="text-xs text-gray-400">暂无检查项</span>}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-12">暂无慢病记录</div>}
      </div>

      {modalType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                {modalType === 'disease' ? '添加慢病' : modalType === 'medication' ? '添加用药' : '添加检查项'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {modalType === 'disease' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">疾病类型</label>
                  <select value={diseaseForm.type} onChange={e => setDiseaseForm({ ...diseaseForm, type: e.target.value as DiseaseType })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {(Object.entries(DISEASE_TYPE_LABELS) as [DiseaseType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-gray-600 mb-1">确诊日期</label><input type="date" value={diseaseForm.diagnosisDate} onChange={e => setDiseaseForm({ ...diseaseForm, diagnosisDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">目标指标</label><input value={diseaseForm.targetIndicator} onChange={e => setDiseaseForm({ ...diseaseForm, targetIndicator: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="如：血压<140/90mmHg" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">随访周期（天/次）</label><input type="number" value={diseaseForm.followUpCycleDays} onChange={e => setDiseaseForm({ ...diseaseForm, followUpCycleDays: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">注意事项</label><input value={diseaseForm.precautions} onChange={e => setDiseaseForm({ ...diseaseForm, precautions: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="饮食、运动等注意事项" /></div>
              </div>
            )}

            {modalType === 'medication' && (
              <div className="space-y-3">
                <div><label className="block text-sm text-gray-600 mb-1">药品名称</label><input value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="如：硝苯地平" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">剂量</label><input value={medForm.dosage} onChange={e => setMedForm({ ...medForm, dosage: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="如：10mg" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">用药频率</label><input value={medForm.frequency} onChange={e => setMedForm({ ...medForm, frequency: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="如：每日1次" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">开始日期</label><input type="date" value={medForm.startDate} onChange={e => setMedForm({ ...medForm, startDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            )}

            {modalType === 'checkItem' && (
              <div className="space-y-3">
                <div><label className="block text-sm text-gray-600 mb-1">检查项目</label><input value={checkForm.name} onChange={e => setCheckForm({ ...checkForm, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="如：肝功能" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">检查周期</label><input value={checkForm.cycle} onChange={e => setCheckForm({ ...checkForm, cycle: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="如：每3个月" /></div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={modalType === 'disease' ? handleAddDisease : modalType === 'medication' ? handleAddMed : handleAddCheck} className="px-4 py-2 text-sm bg-coral-500 text-white rounded-lg hover:bg-coral-600">确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

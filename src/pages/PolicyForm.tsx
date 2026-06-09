import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { INSURANCE_TYPES } from '@/types/insurance'
import type { InsuranceType } from '@/types/insurance'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'

export default function PolicyForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { policies, addPolicy, updatePolicy, getInsuredPersons } = useInsuranceStore()

  const existingPolicy = useMemo(
    () => (isEdit ? policies.find((p) => p.id === id) : undefined),
    [isEdit, id, policies]
  )

  const persons = useMemo(() => getInsuredPersons(), [getInsuredPersons, policies])

  const [form, setForm] = useState({
    insuredPerson: '',
    insuranceType: '' as InsuranceType | '',
    company: '',
    coverageAmount: '',
    premium: '',
    paymentDate: '',
    expiryDate: '',
    agent: '',
    photo: '',
  })

  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (existingPolicy) {
      setForm({
        insuredPerson: existingPolicy.insuredPerson,
        insuranceType: existingPolicy.insuranceType,
        company: existingPolicy.company,
        coverageAmount: String(existingPolicy.coverageAmount),
        premium: String(existingPolicy.premium),
        paymentDate: existingPolicy.paymentDate,
        expiryDate: existingPolicy.expiryDate,
        agent: existingPolicy.agent,
        photo: existingPolicy.photo,
      })
    }
  }, [existingPolicy])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photo: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const required = ['insuredPerson', 'insuranceType', 'company', 'coverageAmount', 'premium', 'paymentDate', 'expiryDate']
    const newErrors: Record<string, boolean> = {}
    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        newErrors[field] = true
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data = {
      insuredPerson: form.insuredPerson,
      insuranceType: form.insuranceType as InsuranceType,
      company: form.company,
      coverageAmount: Number(form.coverageAmount),
      premium: Number(form.premium),
      paymentDate: form.paymentDate,
      expiryDate: form.expiryDate,
      agent: form.agent,
      photo: form.photo,
    }

    const policyId = isEdit && id
      ? (updatePolicy(id, data), id)
      : addPolicy(data)

    navigate(`/policy/${policyId}`)
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? '编辑保单' : '添加保单'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">投保人 *</label>
          <input
            type="text"
            list="person-suggestions"
            value={form.insuredPerson}
            onChange={(e) => handleChange('insuredPerson', e.target.value)}
            className={`form-input ${errors.insuredPerson ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="输入投保人姓名"
          />
          <datalist id="person-suggestions">
            {persons.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="form-label">险种 *</label>
          <select
            value={form.insuranceType}
            onChange={(e) => handleChange('insuranceType', e.target.value)}
            className={`form-input ${errors.insuranceType ? 'border-red-400 focus:ring-red-400' : ''}`}
          >
            <option value="">请选择险种</option>
            {INSURANCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">保险公司 *</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`form-input ${errors.company ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="输入保险公司名称"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">保额（万元）*</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.coverageAmount}
              onChange={(e) => handleChange('coverageAmount', e.target.value)}
              className={`form-input ${errors.coverageAmount ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="0"
            />
          </div>
          <div>
            <label className="form-label">保费（元）*</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.premium}
              onChange={(e) => handleChange('premium', e.target.value)}
              className={`form-input ${errors.premium ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">缴费日期 *</label>
            <input
              type="date"
              value={form.paymentDate}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className={`form-input ${errors.paymentDate ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
          <div>
            <label className="form-label">到期日期 *</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              className={`form-input ${errors.expiryDate ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
        </div>

        <div>
          <label className="form-label">代理人</label>
          <input
            type="text"
            value={form.agent}
            onChange={(e) => handleChange('agent', e.target.value)}
            className="form-input"
            placeholder="输入代理人姓名"
          />
        </div>

        <div>
          <label className="form-label">保单照片</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {form.photo ? (
            <div className="relative inline-block">
              <img
                src={form.photo}
                alt="保单照片"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors"
            >
              <Upload size={24} />
              <span className="text-xs">点击上传</span>
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={16} />
            保存
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

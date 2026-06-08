import { useStore, generateId } from '@/store'
import type { Elder } from '@/types'
import { useNavigate, useParams } from 'react-router-dom'
import { User, Building2, Stethoscope, Phone, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

const emptyForm = {
  name: '',
  age: '',
  hospital: '',
  doctor: '',
  emergencyContact: '',
  emergencyPhone: '',
  insuranceType: '',
  insuranceNumber: '',
}

type FormKey = keyof typeof emptyForm

export default function ElderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { elders, addElder, updateElder } = useStore()
  const isEdit = id && id !== 'new'

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isEdit) {
      const elder = elders.find((e) => e.id === id)
      if (elder) {
        setForm({
          name: elder.name,
          age: String(elder.age),
          hospital: elder.hospital,
          doctor: elder.doctor,
          emergencyContact: elder.emergencyContact,
          emergencyPhone: elder.emergencyPhone,
          insuranceType: elder.insuranceType,
          insuranceNumber: elder.insuranceNumber,
        })
      }
    }
  }, [id, isEdit, elders])

  const handleChange = (key: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Elder = {
      id: isEdit ? id! : generateId(),
      name: form.name,
      age: Number(form.age) || 0,
      hospital: form.hospital,
      doctor: form.doctor,
      emergencyContact: form.emergencyContact,
      emergencyPhone: form.emergencyPhone,
      insuranceType: form.insuranceType,
      insuranceNumber: form.insuranceNumber,
    }
    if (isEdit) {
      updateElder(id!, data)
    } else {
      addElder(data)
    }
    navigate('/elders')
  }

  const sections = [
    {
      label: '基本信息',
      icon: User,
      color: 'text-[#E8725A]',
      bgColor: 'bg-[#E8725A]/10',
      fields: [
        { key: 'name' as FormKey, label: '姓名', placeholder: '请输入姓名' },
        { key: 'age' as FormKey, label: '年龄', placeholder: '请输入年龄', type: 'number' },
      ],
    },
    {
      label: '医疗信息',
      icon: Building2,
      color: 'text-sky-500',
      bgColor: 'bg-sky-50',
      fields: [
        { key: 'hospital' as FormKey, label: '常用医院', placeholder: '请输入常用医院' },
      ],
    },
    {
      label: '',
      icon: Stethoscope,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      fields: [
        { key: 'doctor' as FormKey, label: '主治医生', placeholder: '请输入主治医生' },
      ],
      noTitle: true,
    },
    {
      label: '紧急联系',
      icon: Phone,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      fields: [
        { key: 'emergencyContact' as FormKey, label: '紧急联系人', placeholder: '请输入紧急联系人' },
        { key: 'emergencyPhone' as FormKey, label: '联系电话', placeholder: '请输入联系电话' },
      ],
    },
    {
      label: '医保信息',
      icon: Shield,
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
      fields: [
        { key: 'insuranceType' as FormKey, label: '医保类型', placeholder: '请输入医保类型' },
        { key: 'insuranceNumber' as FormKey, label: '医保号', placeholder: '请输入医保号' },
      ],
    },
  ]

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-stone-800 mb-6">
        {isEdit ? '编辑老人信息' : '添加老人'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-0">
        {sections.map((section, idx) => (
          <div key={idx}>
            {(section.label || section.noTitle) && section.label && (
              <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
                <div className={`w-7 h-7 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                  <section.icon className={`w-3.5 h-3.5 ${section.color}`} />
                </div>
                <span className="font-semibold text-sm text-stone-700">{section.label}</span>
              </div>
            )}
            {section.noTitle && !section.label && (
              <div />
            )}
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#E8725A]/30 focus:border-[#E8725A] transition-colors"
                  />
                </div>
              ))}
            </div>
            {idx < sections.length - 1 && (
              <div className="border-t border-stone-100 mt-4" />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-8">
          <button
            type="button"
            onClick={() => navigate('/elders')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#E8725A] text-white hover:bg-[#C95A43] transition-colors shadow-sm"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useScoreStore } from '@/store/useScoreStore'
import { useBorrowStore } from '@/store/useBorrowStore'
import type { Score, VoicePart, BindingStatus, ScoreStatus } from '@/types'

interface ScoreFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Score | null
}

const voicePartOptions = [
  { value: '女高音', label: '女高音' },
  { value: '女低音', label: '女低音' },
  { value: '男高音', label: '男高音' },
  { value: '男低音', label: '男低音' },
  { value: '混声', label: '混声' },
]

const bindingStatusOptions = [
  { value: '已装订', label: '已装订' },
  { value: '未装订', label: '未装订' },
  { value: '半装订', label: '半装订' },
]

const statusOptions = [
  { value: '正常', label: '正常' },
  { value: '破损', label: '破损' },
  { value: '待重印', label: '待重印' },
]

interface FormErrors {
  name?: string
  voice_part?: string
  version?: string
  pages?: string
  binding_status?: string
  total_stock?: string
}

export default function ScoreForm({ isOpen, onClose, initialData }: ScoreFormProps) {
  const { addScore, updateScore } = useScoreStore()
  const { getBorrowsByScore } = useBorrowStore()
  const [formData, setFormData] = useState({
    name: '',
    voice_part: '' as VoicePart | '',
    version: '',
    pages: '',
    binding_status: '' as BindingStatus | '',
    total_stock: '',
    photo_url: '',
    status: '正常' as ScoreStatus,
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const isEdit = !!initialData

  const borrowedCount = useMemo(() => {
    if (!isEdit || !initialData) return 0
    return getBorrowsByScore(initialData.id).filter(
      (r) => r.status === '借阅中' || r.status === '逾期'
    ).length
  }, [isEdit, initialData, getBorrowsByScore])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        voice_part: initialData.voice_part,
        version: initialData.version,
        pages: String(initialData.pages),
        binding_status: initialData.binding_status,
        total_stock: String(initialData.total_stock),
        photo_url: initialData.photo_url || '',
        status: initialData.status,
        notes: initialData.notes || '',
      })
    } else {
      setFormData({
        name: '',
        voice_part: '',
        version: '',
        pages: '',
        binding_status: '',
        total_stock: '',
        photo_url: '',
        status: '正常',
        notes: '',
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入曲名'
    }

    if (!formData.voice_part) {
      newErrors.voice_part = '请选择声部'
    }

    if (!formData.version.trim()) {
      newErrors.version = '请输入版本'
    }

    if (!formData.pages) {
      newErrors.pages = '请输入页数'
    } else if (Number(formData.pages) <= 0) {
      newErrors.pages = '页数必须大于0'
    }

    if (!formData.binding_status) {
      newErrors.binding_status = '请选择装订状态'
    }

    if (!formData.total_stock) {
      newErrors.total_stock = '请输入总库存'
    } else if (Number(formData.total_stock) < 0) {
      newErrors.total_stock = '库存不能为负数'
    } else if (isEdit && Number(formData.total_stock) < borrowedCount) {
      newErrors.total_stock = `当前有 ${borrowedCount} 册未归还，总库存不能少于已借出数量`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const totalStock = Number(formData.total_stock)
    const scoreData = {
      name: formData.name.trim(),
      voice_part: formData.voice_part as VoicePart,
      version: formData.version.trim(),
      pages: Number(formData.pages),
      binding_status: formData.binding_status as BindingStatus,
      total_stock: totalStock,
      available_stock: isEdit ? totalStock - borrowedCount : totalStock,
      photo_url: formData.photo_url.trim() || undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
    }

    if (isEdit && initialData) {
      updateScore(initialData.id, scoreData)
    } else {
      addScore(scoreData)
    }

    onClose()
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑曲谱' : '新增曲谱'}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? '保存修改' : '确认添加'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="曲名"
            placeholder="请输入曲名"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
          />
          <Select
            label="声部"
            placeholder="请选择声部"
            options={voicePartOptions}
            value={formData.voice_part}
            onChange={(e) => handleInputChange('voice_part', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="版本"
            placeholder="请输入版本号，如 1.0"
            value={formData.version}
            onChange={(e) => handleInputChange('version', e.target.value)}
            error={errors.version}
          />
          <Input
            label="页数"
            type="number"
            placeholder="请输入页数"
            value={formData.pages}
            onChange={(e) => handleInputChange('pages', e.target.value)}
            error={errors.pages}
            min={1}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="装订状态"
            placeholder="请选择装订状态"
            options={bindingStatusOptions}
            value={formData.binding_status}
            onChange={(e) => handleInputChange('binding_status', e.target.value)}
          />
          <div>
            <Input
              label="总库存"
              type="number"
              placeholder="请输入总库存数量"
              value={formData.total_stock}
              onChange={(e) => handleInputChange('total_stock', e.target.value)}
              error={errors.total_stock}
              min={0}
            />
            {isEdit && borrowedCount > 0 && (
              <p className="mt-1 text-xs text-amber-600">
                当前已借出 {borrowedCount} 册，可用库存将自动更新为 {formData.total_stock ? Number(formData.total_stock) - borrowedCount : '-'} 册
              </p>
            )}
          </div>
        </div>

        {isEdit && (
          <Select
            label="状态"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
          />
        )}

        <Input
          label="照片URL"
          placeholder="请输入曲谱照片链接（可选）"
          value={formData.photo_url}
          onChange={(e) => handleInputChange('photo_url', e.target.value)}
        />

        <Textarea
          label="备注"
          placeholder="请输入备注信息（可选）"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  )
}

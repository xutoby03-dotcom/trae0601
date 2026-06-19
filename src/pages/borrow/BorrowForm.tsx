import { useState } from 'react'
import { BookOpen, User, Calendar, Pencil, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import { useScoreStore } from '@/store/useScoreStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useBorrowStore } from '@/store/useBorrowStore'
import type { VoicePart } from '@/types'

const voicePartColors: Record<VoicePart, string> = {
  女高音: 'bg-pink-100 text-pink-700',
  女低音: 'bg-purple-100 text-purple-700',
  男高音: 'bg-blue-100 text-blue-700',
  男低音: 'bg-indigo-100 text-indigo-700',
  混声: 'bg-green-100 text-green-700',
}

interface FormErrors {
  score_id?: string
  member_id?: string
  rehearsal_date?: string
  expected_return_date?: string
}

export default function BorrowForm() {
  const { scores } = useScoreStore()
  const { members } = useMemberStore()
  const { addBorrowRecord } = useBorrowStore()

  const [formData, setFormData] = useState({
    score_id: '',
    member_id: '',
    rehearsal_date: '',
    expected_return_date: '',
    with_pencil_mark: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const availableScores = scores.filter((score) => score.available_stock > 0)

  const scoreOptions = availableScores.map((score) => ({
    value: score.id,
    label: `${score.name} (${score.voice_part}) - 可用 ${score.available_stock} 册`,
  }))

  const memberOptions = members
    .slice()
    .sort((a, b) => {
      const voiceOrder = ['女高音', '女低音', '男高音', '男低音', '混声']
      return voiceOrder.indexOf(a.voice_part) - voiceOrder.indexOf(b.voice_part)
    })
    .map((member) => ({
      value: member.id,
      label: `${member.name} (${member.voice_part})`,
    }))

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.score_id) {
      newErrors.score_id = '请选择曲谱'
    }

    if (!formData.member_id) {
      newErrors.member_id = '请选择队员'
    }

    if (!formData.rehearsal_date) {
      newErrors.rehearsal_date = '请选择排练日期'
    }

    if (!formData.expected_return_date) {
      newErrors.expected_return_date = '请选择预计归还日期'
    } else if (formData.rehearsal_date && formData.expected_return_date < formData.rehearsal_date) {
      newErrors.expected_return_date = '预计归还日期不能早于排练日期'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const selectedScore = scores.find((s) => s.id === formData.score_id)
    const selectedMember = members.find((m) => m.id === formData.member_id)

    if (!selectedScore || !selectedMember) {
      return
    }

    addBorrowRecord({
      score_id: formData.score_id,
      member_id: formData.member_id,
      rehearsal_date: new Date(formData.rehearsal_date).toISOString(),
      expected_return_date: new Date(formData.expected_return_date).toISOString(),
      with_pencil_mark: formData.with_pencil_mark,
      has_missing_pages: false,
      has_damage: false,
      has_writing: false,
      needs_reprint: false,
    })

    setShowSuccess(true)

    setFormData({
      score_id: '',
      member_id: '',
      rehearsal_date: '',
      expected_return_date: '',
      with_pencil_mark: false,
    })
    setErrors({})

    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedScore = scores.find((s) => s.id === formData.score_id)
  const selectedMember = members.find((m) => m.id === formData.member_id)

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">借阅登记成功</p>
            <p className="text-sm text-green-600">曲谱已成功借出，库存已更新</p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">借阅登记</h2>
            <p className="text-sm text-gray-500">登记曲谱借阅信息，自动扣减库存</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Select
                label="曲谱选择"
                placeholder="请选择要借阅的曲谱"
                options={scoreOptions}
                value={formData.score_id}
                onChange={(e) => handleInputChange('score_id', e.target.value)}
              />
              {errors.score_id && <p className="mt-1 text-xs text-red-500">{errors.score_id}</p>}
            </div>
            <div>
              <Select
                label="队员选择"
                placeholder="请选择借阅队员"
                options={memberOptions}
                value={formData.member_id}
                onChange={(e) => handleInputChange('member_id', e.target.value)}
              />
              {errors.member_id && <p className="mt-1 text-xs text-red-500">{errors.member_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="排练日期"
              type="date"
              value={formData.rehearsal_date}
              onChange={(e) => handleInputChange('rehearsal_date', e.target.value)}
              error={errors.rehearsal_date}
            />
            <Input
              label="预计归还日期"
              type="date"
              value={formData.expected_return_date}
              onChange={(e) => handleInputChange('expected_return_date', e.target.value)}
              error={errors.expected_return_date}
            />
          </div>

          <div className="pt-2">
            <Checkbox
              label="是否带铅笔标记"
              checked={formData.with_pencil_mark}
              onChange={(e) => handleInputChange('with_pencil_mark', e.target.checked)}
            />
            <p className="text-xs text-gray-500 mt-1 ml-7">勾选表示队员将使用铅笔在曲谱上做标记</p>
          </div>

          {(selectedScore || selectedMember) && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">借阅信息预览</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {selectedScore && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedScore.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${voicePartColors[selectedScore.voice_part]}`}
                      >
                        {selectedScore.voice_part}
                      </span>
                    </div>
                  </div>
                )}
                {selectedMember && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedMember.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${voicePartColors[selectedMember.voice_part]}`}
                      >
                        {selectedMember.voice_part}
                      </span>
                    </div>
                  </div>
                )}
                {formData.rehearsal_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-700">排练：{formData.rehearsal_date}</p>
                  </div>
                )}
                {formData.expected_return_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-700">预计归还：{formData.expected_return_date}</p>
                  </div>
                )}
                {formData.with_pencil_mark && (
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Pencil className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-700">带铅笔标记</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button size="lg" onClick={handleSubmit}>
              <CheckCircle className="w-4 h-4 mr-2" />
              确认借阅
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Checkbox from '@/components/ui/Checkbox'
import { useMemberStore } from '@/store/useMemberStore'
import type { Member, VoicePart } from '@/types'

interface MemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  initialData?: Member
}

const voicePartOptions = [
  { value: '女高音', label: '女高音' },
  { value: '女低音', label: '女低音' },
  { value: '男高音', label: '男高音' },
  { value: '男低音', label: '男低音' },
  { value: '混声', label: '混声' },
]

export default function MemberForm({ isOpen, onClose, onSubmit, initialData }: MemberFormProps) {
  const { addMember, updateMember } = useMemberStore()
  const [name, setName] = useState('')
  const [voicePart, setVoicePart] = useState<VoicePart | ''>('')
  const [phone, setPhone] = useState('')
  const [needsLargePrint, setNeedsLargePrint] = useState(false)
  const [attendanceNotes, setAttendanceNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!initialData

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setVoicePart(initialData.voice_part)
      setPhone(initialData.phone)
      setNeedsLargePrint(initialData.needs_large_print)
      setAttendanceNotes(initialData.attendance_notes || '')
    } else {
      setName('')
      setVoicePart('')
      setPhone('')
      setNeedsLargePrint(false)
      setAttendanceNotes('')
    }
    setErrors({})
  }, [initialData, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = '请输入姓名'
    }
    if (!voicePart) {
      newErrors.voice_part = '请选择声部'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const memberData = {
      name: name.trim(),
      voice_part: voicePart as VoicePart,
      phone: phone.trim(),
      needs_large_print: needsLargePrint,
      attendance_notes: attendanceNotes.trim() || undefined,
    }

    if (isEdit && initialData) {
      updateMember(initialData.id, memberData)
    } else {
      addMember(memberData)
    }

    onSubmit()
    onClose()
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        取消
      </Button>
      <Button onClick={handleSubmit}>
        {isEdit ? '保存修改' : '新增队员'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑队员' : '新增队员'}
      footer={footer}
    >
      <div className="space-y-4">
        <Input
          label="姓名"
          placeholder="请输入姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <div>
          <Select
            label="声部"
            placeholder="请选择声部"
            options={voicePartOptions}
            value={voicePart}
            onChange={(e) => setVoicePart(e.target.value as VoicePart | '')}
          />
          {errors.voice_part && <p className="mt-1 text-xs text-red-500">{errors.voice_part}</p>}
        </div>
        <Input
          label="联系方式"
          placeholder="请输入联系方式"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Checkbox
          label="需要大字版曲谱"
          checked={needsLargePrint}
          onChange={(e) => setNeedsLargePrint(e.target.checked)}
        />
        <Textarea
          label="出勤备注"
          placeholder="请输入出勤备注（选填）"
          value={attendanceNotes}
          onChange={(e) => setAttendanceNotes(e.target.value)}
          rows={4}
        />
      </div>
    </Modal>
  )
}

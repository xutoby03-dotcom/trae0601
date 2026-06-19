import { useState } from 'react'
import { CheckCircle, AlertCircle, BookOpen, User, Calendar, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'
import Empty from '@/components/ui/Empty'
import { useBorrowStore } from '@/store/useBorrowStore'
import { useScoreStore } from '@/store/useScoreStore'
import { useMemberStore } from '@/store/useMemberStore'
import type { BorrowRecord, VoicePart, BorrowStatus } from '@/types'

const voicePartColors: Record<VoicePart, string> = {
  女高音: 'bg-pink-100 text-pink-700',
  女低音: 'bg-purple-100 text-purple-700',
  男高音: 'bg-blue-100 text-blue-700',
  男低音: 'bg-indigo-100 text-indigo-700',
  混声: 'bg-green-100 text-green-700',
}

const statusColorMap: Record<BorrowStatus, 'success' | 'danger' | 'info'> = {
  借阅中: 'info',
  已归还: 'success',
  逾期: 'danger',
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

export default function ReturnCheck() {
  const { getActiveBorrows, returnBorrowRecord } = useBorrowStore()
  const { scores } = useScoreStore()
  const { members } = useMemberStore()

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [checkData, setCheckData] = useState({
    has_missing_pages: false,
    has_damage: false,
    has_writing: false,
    needs_reprint: false,
    return_notes: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const activeBorrows = getActiveBorrows()

  const selectedRecord = activeBorrows.find((r) => r.id === selectedRecordId) || null
  const selectedScore = selectedRecord ? scores.find((s) => s.id === selectedRecord.score_id) : null
  const selectedMember = selectedRecord ? members.find((m) => m.id === selectedRecord.member_id) : null

  const handleSelectRecord = (record: BorrowRecord) => {
    setSelectedRecordId(record.id)
    setCheckData({
      has_missing_pages: false,
      has_damage: false,
      has_writing: false,
      needs_reprint: false,
      return_notes: '',
    })
    setShowSuccess(false)
  }

  const handleCheckboxChange = (field: keyof typeof checkData, checked: boolean) => {
    setCheckData((prev) => ({ ...prev, [field]: checked }))
  }

  const handleReturn = () => {
    if (!selectedRecord) return

    returnBorrowRecord(selectedRecord.id, {
      has_missing_pages: checkData.has_missing_pages,
      has_damage: checkData.has_damage,
      has_writing: checkData.has_writing,
      needs_reprint: checkData.needs_reprint,
      return_notes: checkData.return_notes.trim() || undefined,
    })

    setShowSuccess(true)
    setSelectedRecordId(null)
    setCheckData({
      has_missing_pages: false,
      has_damage: false,
      has_writing: false,
      needs_reprint: false,
      return_notes: '',
    })

    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">归还成功</p>
            <p className="text-sm text-green-600">曲谱已成功归还，库存已更新</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">待归还曲谱</h3>
            <p className="text-xs text-gray-500 mt-0.5">共 {activeBorrows.length} 条待归还记录</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {activeBorrows.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {activeBorrows.map((record) => {
                  const score = scores.find((s) => s.id === record.score_id)
                  const member = members.find((m) => m.id === record.member_id)
                  const isSelected = selectedRecordId === record.id

                  return (
                    <li
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className={`p-4 cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-primary-50 border-l-4 border-primary-600'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{score?.name || '未知曲谱'}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">{member?.name || '未知队员'}</span>
                            {member && (
                              <span
                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium flex-shrink-0 ${voicePartColors[member.voice_part]}`}
                              >
                                {member.voice_part}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500">借阅：{formatDate(record.rehearsal_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500">预计归还：{formatDate(record.expected_return_date)}</span>
                          </div>
                        </div>
                        <Badge variant={statusColorMap[record.status]} className="flex-shrink-0">
                          {record.status}
                        </Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Empty
                title="暂无待归还记录"
                description="所有曲谱均已归还"
                className="py-12"
              />
            )}
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          {selectedRecord && selectedScore && selectedMember ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">归还检查</h3>
                  <p className="text-sm text-gray-500">检查曲谱状态，确认归还</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-medium text-gray-900 mb-4">借阅信息</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">曲谱</p>
                      <p className="font-medium text-gray-900 mt-0.5">{selectedScore.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${voicePartColors[selectedScore.voice_part]}`}
                      >
                        {selectedScore.voice_part}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">借阅人</p>
                      <p className="font-medium text-gray-900 mt-0.5">{selectedMember.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${voicePartColors[selectedMember.voice_part]}`}
                      >
                        {selectedMember.voice_part}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">排练日期</p>
                      <p className="text-gray-900 mt-0.5">{formatDate(selectedRecord.rehearsal_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">预计归还</p>
                      <p className="text-gray-900 mt-0.5">{formatDate(selectedRecord.expected_return_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  检查项
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Checkbox
                    label="是否缺页"
                    checked={checkData.has_missing_pages}
                    onChange={(e) => handleCheckboxChange('has_missing_pages', e.target.checked)}
                  />
                  <Checkbox
                    label="是否破损"
                    checked={checkData.has_damage}
                    onChange={(e) => handleCheckboxChange('has_damage', e.target.checked)}
                  />
                  <Checkbox
                    label="是否涂写"
                    checked={checkData.has_writing}
                    onChange={(e) => handleCheckboxChange('has_writing', e.target.checked)}
                  />
                  <Checkbox
                    label="是否需要重印"
                    checked={checkData.needs_reprint}
                    onChange={(e) => handleCheckboxChange('needs_reprint', e.target.checked)}
                  />
                </div>
              </div>

              <div>
                <Textarea
                  label="归还备注"
                  placeholder="请输入归还时的备注信息（可选）"
                  value={checkData.return_notes}
                  onChange={(e) => setCheckData((prev) => ({ ...prev, return_notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button size="lg" onClick={handleReturn}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  确认归还
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">请选择待归还记录</h3>
              <p className="text-sm text-gray-500 text-center">
                从左侧列表中选择一条待归还记录
                <br />
                进行归还检查
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

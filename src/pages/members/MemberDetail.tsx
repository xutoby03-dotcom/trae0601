import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, User, Phone, FileText, BookOpen, Clock } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Empty from '@/components/ui/Empty'
import Modal from '@/components/ui/Modal'
import { useMemberStore } from '@/store/useMemberStore'
import { useBorrowStore } from '@/store/useBorrowStore'
import { useScoreStore } from '@/store/useScoreStore'
import type { VoicePart } from '@/types'

interface MemberDetailProps {
  onEdit: () => void
}

const voicePartColors: Record<VoicePart, string> = {
  '女高音': 'bg-pink-100 text-pink-700',
  '女低音': 'bg-purple-100 text-purple-700',
  '男高音': 'bg-blue-100 text-blue-700',
  '男低音': 'bg-green-100 text-green-700',
  '混声': 'bg-orange-100 text-orange-700',
}

const statusColors: Record<string, string> = {
  '借阅中': 'bg-blue-100 text-blue-700',
  '已归还': 'bg-green-100 text-green-700',
  '逾期': 'bg-red-100 text-red-700',
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function MemberDetail({ onEdit }: MemberDetailProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getMemberById, deleteMember } = useMemberStore()
  const { getBorrowsByMember } = useBorrowStore()
  const { getScoreById } = useScoreStore()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const member = id ? getMemberById(id) : undefined
  const borrowRecords = id ? getBorrowsByMember(id) : []

  if (!member) {
    return (
      <Layout title="队员详情" subtitle="查看队员详细信息">
        <Empty
          title="队员不存在"
          description="未找到该队员信息"
          action={
            <Button onClick={() => navigate('/members')}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              返回列表
            </Button>
          }
        />
      </Layout>
    )
  }

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (member) {
      deleteMember(member.id)
      navigate('/members')
    }
  }

  const sortedBorrowRecords = [...borrowRecords].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <Layout title="队员详情" subtitle="查看队员详细信息">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/members')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            返回列表
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1.5" />
              编辑
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              删除
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${voicePartColors[member.voice_part]}`}>
                  {member.voice_part}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">联系方式</p>
                  <p className="text-sm font-medium text-gray-700">{member.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">大字版曲谱</p>
                  <Badge variant={member.needs_large_print ? 'info' : 'default'}>
                    {member.needs_large_print ? '需要' : '不需要'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              出勤备注
            </h3>
            {member.attendance_notes ? (
              <p className="text-gray-600 leading-relaxed">{member.attendance_notes}</p>
            ) : (
              <p className="text-gray-400 italic">暂无出勤备注</p>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-500" />
            借阅历史
          </h3>
          {sortedBorrowRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      曲谱名称
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      排练日期
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      预计归还
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      铅笔标注
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedBorrowRecords.map((record) => {
                    const score = getScoreById(record.score_id)
                    return (
                      <tr key={record.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {score?.name || '未知曲谱'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(record.rehearsal_date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(record.expected_return_date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[record.status]}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.with_pencil_mark ? '是' : '否'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="暂无借阅记录"
              description="该队员还没有借阅过任何曲谱"
            />
          )}
        </Card>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="确认删除"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          确定要删除队员 <span className="font-semibold text-gray-900">{member.name}</span> 吗？
          此操作不可撤销。
        </p>
      </Modal>
    </Layout>
  )
}

import { useState } from 'react'
import { ArrowLeft, Edit, Trash2, Music, FileText, Package, BookOpen, Calendar, User } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Empty from '@/components/ui/Empty'
import Modal from '@/components/ui/Modal'
import { useScoreStore } from '@/store/useScoreStore'
import { useBorrowStore } from '@/store/useBorrowStore'
import { useMemberStore } from '@/store/useMemberStore'
import type { Score, ScoreStatus, VoicePart, BorrowStatus } from '@/types'

interface ScoreDetailProps {
  score: Score
  onBack: () => void
  onEdit: (score: Score) => void
}

const statusColorMap: Record<ScoreStatus, 'success' | 'danger' | 'warning'> = {
  正常: 'success',
  破损: 'danger',
  待重印: 'warning',
}

const voicePartColors: Record<VoicePart, string> = {
  女高音: 'bg-pink-100 text-pink-700',
  女低音: 'bg-purple-100 text-purple-700',
  男高音: 'bg-blue-100 text-blue-700',
  男低音: 'bg-indigo-100 text-indigo-700',
  混声: 'bg-green-100 text-green-700',
}

const borrowStatusColors: Record<BorrowStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  借阅中: 'info',
  已归还: 'success',
  逾期: 'danger',
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function ScoreDetail({ score, onBack, onEdit }: ScoreDetailProps) {
  const { deleteScore, getScoreById } = useScoreStore()
  const { getBorrowsByScore } = useBorrowStore()
  const { getMemberById } = useMemberStore()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const currentScore = getScoreById(score.id) || score
  const borrowRecords = getBorrowsByScore(score.id).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteScore(score.id)
    setDeleteModalOpen(false)
    onBack()
  }

  const borrowColumns = [
    {
      key: 'member_name',
      title: '借阅人',
      render: (row: (typeof borrowRecords)[0]) => {
        const member = getMemberById(row.member_id)
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>{member?.name || '未知'}</span>
          </div>
        )
      },
    },
    {
      key: 'rehearsal_date',
      title: '排练日期',
      render: (row: (typeof borrowRecords)[0]) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(row.rehearsal_date)}</span>
        </div>
      ),
    },
    {
      key: 'expected_return_date',
      title: '预计归还',
      render: (row: (typeof borrowRecords)[0]) => formatDate(row.expected_return_date),
    },
    {
      key: 'status',
      title: '状态',
      render: (row: (typeof borrowRecords)[0]) => (
        <Badge variant={borrowStatusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: 'with_pencil_mark',
      title: '铅笔标注',
      render: (row: (typeof borrowRecords)[0]) => (
        <span>{row.with_pencil_mark ? '是' : '否'}</span>
      ),
    },
    {
      key: 'actual_return_date',
      title: '实际归还',
      render: (row: (typeof borrowRecords)[0]) =>
        row.actual_return_date ? formatDate(row.actual_return_date) : '-',
    },
  ]

  return (
    <Layout title={currentScore.name} subtitle="曲谱详情">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onEdit(currentScore)}>
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Button>
            <Button variant="danger" onClick={handleDeleteClick}>
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              {currentScore.photo_url ? (
                <img
                  src={currentScore.photo_url}
                  alt={currentScore.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <Music className="w-16 h-16 mb-2" />
                  <span className="text-sm">暂无照片</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${voicePartColors[currentScore.voice_part]}`}
                  >
                    {currentScore.voice_part}
                  </span>
                  <Badge variant={statusColorMap[currentScore.status]}>
                    {currentScore.status}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{currentScore.name}</h2>
                <p className="text-sm text-gray-500">版本 v{currentScore.version}</p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">声部</p>
                  <p className="text-gray-900 font-medium">{currentScore.voice_part}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">版本</p>
                  <p className="text-gray-900 font-medium">v{currentScore.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">页数</p>
                  <p className="text-gray-900 font-medium">{currentScore.pages} 页</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">装订状态</p>
                  <p className="text-gray-900 font-medium">{currentScore.binding_status}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                库存信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">总库存</p>
                  <p className="text-2xl font-bold text-gray-900">{currentScore.total_stock}</p>
                  <p className="text-xs text-gray-400">册</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">可用库存</p>
                  <p
                    className={`text-2xl font-bold ${
                      currentScore.available_stock === 0
                        ? 'text-red-600'
                        : currentScore.available_stock <= 2
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {currentScore.available_stock}
                  </p>
                  <p className="text-xs text-gray-400">册</p>
                </div>
              </div>
            </Card>

            {currentScore.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  备注
                </h3>
                <p className="text-gray-600">{currentScore.notes}</p>
              </Card>
            )}
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            借阅历史
          </h3>
          {borrowRecords.length > 0 ? (
            <DataTable columns={borrowColumns} data={borrowRecords} />
          ) : (
            <Empty
              title="暂无借阅记录"
              description="这首曲谱还没有被借阅过"
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
            <Button variant="danger" onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          确定要删除 <span className="font-medium text-gray-900">{currentScore.name}</span> 吗？
          <br />
          <span className="text-sm text-gray-500">此操作不可撤销。</span>
        </p>
      </Modal>
    </Layout>
  )
}

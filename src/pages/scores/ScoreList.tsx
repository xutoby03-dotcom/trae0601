import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Empty from '@/components/ui/Empty'
import Modal from '@/components/ui/Modal'
import { useScoreStore } from '@/store/useScoreStore'
import type { Score, VoicePart, ScoreStatus } from '@/types'

interface ScoreListProps {
  onViewDetail: (score: Score) => void
  onEdit: (score: Score) => void
  onAdd: () => void
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

const voicePartOptions = [
  { value: '', label: '全部声部' },
  { value: '女高音', label: '女高音' },
  { value: '女低音', label: '女低音' },
  { value: '男高音', label: '男高音' },
  { value: '男低音', label: '男低音' },
  { value: '混声', label: '混声' },
]

export default function ScoreList({ onViewDetail, onEdit, onAdd }: ScoreListProps) {
  const { scores, deleteScore } = useScoreStore()
  const [searchText, setSearchText] = useState('')
  const [voicePartFilter, setVoicePartFilter] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [scoreToDelete, setScoreToDelete] = useState<Score | null>(null)

  const filteredScores = useMemo(() => {
    return scores.filter((score) => {
      const matchesSearch = score.name.toLowerCase().includes(searchText.toLowerCase())
      const matchesVoicePart = voicePartFilter ? score.voice_part === voicePartFilter : true
      return matchesSearch && matchesVoicePart
    })
  }, [scores, searchText, voicePartFilter])

  const handleDeleteClick = (score: Score) => {
    setScoreToDelete(score)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (scoreToDelete) {
      deleteScore(scoreToDelete.id)
      setDeleteModalOpen(false)
      setScoreToDelete(null)
    }
  }

  const columns = [
    {
      key: 'name',
      title: '曲名',
      render: (row: Score) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      key: 'voice_part',
      title: '声部',
      render: (row: Score) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${voicePartColors[row.voice_part]}`}
        >
          {row.voice_part}
        </span>
      ),
    },
    {
      key: 'version',
      title: '版本',
      render: (row: Score) => <span className="text-gray-600">v{row.version}</span>,
    },
    {
      key: 'pages',
      title: '页数',
      render: (row: Score) => <span>{row.pages} 页</span>,
    },
    {
      key: 'binding_status',
      title: '装订状态',
      render: (row: Score) => <span>{row.binding_status}</span>,
    },
    {
      key: 'total_stock',
      title: '总库存',
      render: (row: Score) => <span>{row.total_stock} 册</span>,
    },
    {
      key: 'available_stock',
      title: '可用库存',
      render: (row: Score) => (
        <span
          className={`font-medium ${
            row.available_stock === 0
              ? 'text-red-600'
              : row.available_stock <= 2
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}
        >
          {row.available_stock} 册
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (row: Score) => <Badge variant={statusColorMap[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '160px',
      render: (row: Score) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail(row)
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            查看
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(row)
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(row)
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Layout title="曲谱档案管理" subtitle="管理合唱队所有曲谱的基本信息和库存">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索曲名..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={voicePartFilter}
              onChange={(e) => setVoicePartFilter(e.target.value)}
              options={voicePartOptions}
              className="w-full sm:w-40"
            />
          </div>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            新增曲谱
          </Button>
        </div>

        {filteredScores.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredScores}
            onRowClick={(row) => onViewDetail(row)}
          />
        ) : (
          <Empty
            title="暂无曲谱数据"
            description={searchText || voicePartFilter ? '没有找到匹配的曲谱，请尝试其他搜索条件' : '点击右上角按钮添加第一首曲谱'}
            action={
              !searchText && !voicePartFilter && (
                <Button onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  新增曲谱
                </Button>
              )
            }
          />
        )}
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
          确定要删除 <span className="font-medium text-gray-900">{scoreToDelete?.name}</span> 吗？
          <br />
          <span className="text-sm text-gray-500">此操作不可撤销。</span>
        </p>
      </Modal>
    </Layout>
  )
}

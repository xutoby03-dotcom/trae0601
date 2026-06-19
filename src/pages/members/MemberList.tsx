import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Empty from '@/components/ui/Empty'
import Modal from '@/components/ui/Modal'
import { useMemberStore } from '@/store/useMemberStore'
import type { Member, VoicePart } from '@/types'
import type { Column } from '@/components/ui/DataTable'

interface MemberListProps {
  onAdd: () => void
  onEdit: (member: Member) => void
}

const voicePartOptions = [
  { value: '', label: '全部声部' },
  { value: '女高音', label: '女高音' },
  { value: '女低音', label: '女低音' },
  { value: '男高音', label: '男高音' },
  { value: '男低音', label: '男低音' },
  { value: '混声', label: '混声' },
]

const voicePartColors: Record<VoicePart, string> = {
  '女高音': 'bg-pink-100 text-pink-700',
  '女低音': 'bg-purple-100 text-purple-700',
  '男高音': 'bg-blue-100 text-blue-700',
  '男低音': 'bg-green-100 text-green-700',
  '混声': 'bg-orange-100 text-orange-700',
}

export default function MemberList({ onAdd, onEdit }: MemberListProps) {
  const navigate = useNavigate()
  const { members, deleteMember } = useMemberStore()
  const [searchText, setSearchText] = useState('')
  const [voicePartFilter, setVoicePartFilter] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchSearch = member.name.toLowerCase().includes(searchText.toLowerCase()) ||
        member.phone.includes(searchText)
      const matchVoicePart = !voicePartFilter || member.voice_part === voicePartFilter
      return matchSearch && matchVoicePart
    })
  }, [members, searchText, voicePartFilter])

  const handleDelete = (member: Member) => {
    setDeletingMember(member)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (deletingMember) {
      deleteMember(deletingMember.id)
      setDeleteModalOpen(false)
      setDeletingMember(null)
    }
  }

  const handleView = (member: Member) => {
    navigate(`/members/${member.id}`)
  }

  const columns: Column<Member>[] = [
    {
      key: 'name',
      title: '姓名',
      width: '120px',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
    },
    {
      key: 'voice_part',
      title: '声部',
      width: '100px',
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${voicePartColors[row.voice_part]}`}>
          {row.voice_part}
        </span>
      ),
    },
    {
      key: 'phone',
      title: '联系方式',
      width: '140px',
    },
    {
      key: 'needs_large_print',
      title: '大字版',
      width: '100px',
      render: (row) => (
        <Badge variant={row.needs_large_print ? 'info' : 'default'}>
          {row.needs_large_print ? '需要' : '不需要'}
        </Badge>
      ),
    },
    {
      key: 'attendance_notes',
      title: '出勤备注',
      render: (row) => (
        <span className="text-gray-500">
          {row.attendance_notes || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '180px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleView(row)
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
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row)
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Layout title="队员档案" subtitle="管理合唱队所有队员信息">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索姓名或联系方式"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              options={voicePartOptions}
              value={voicePartFilter}
              onChange={(e) => setVoicePartFilter(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            新增队员
          </Button>
        </div>

        {filteredMembers.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredMembers}
            onRowClick={(row) => handleView(row)}
          />
        ) : (
          <Empty
            title="暂无队员数据"
            description={searchText || voicePartFilter ? '没有找到匹配的队员，请尝试其他搜索条件' : '点击上方按钮添加第一位队员'}
            action={
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-1.5" />
                新增队员
              </Button>
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
            <Button variant="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          确定要删除队员 <span className="font-semibold text-gray-900">{deletingMember?.name}</span> 吗？
          此操作不可撤销。
        </p>
      </Modal>
    </Layout>
  )
}

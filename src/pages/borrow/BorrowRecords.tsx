import { useState, useMemo } from 'react'
import { Search, Filter, FileText, Pencil } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
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

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: '借阅中', label: '借阅中' },
  { value: '已归还', label: '已归还' },
  { value: '逾期', label: '逾期' },
]

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

interface BorrowRecordWithInfo extends BorrowRecord {
  score_name: string
  member_name: string
  member_voice_part: VoicePart
}

export default function BorrowRecords() {
  const { borrowRecords } = useBorrowStore()
  const { scores } = useScoreStore()
  const { members } = useMemberStore()

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const recordsWithInfo = useMemo<BorrowRecordWithInfo[]>(() => {
    return borrowRecords
      .map((record) => {
        const score = scores.find((s) => s.id === record.score_id)
        const member = members.find((m) => m.id === record.member_id)
        return {
          ...record,
          score_name: score?.name || '未知曲谱',
          member_name: member?.name || '未知队员',
          member_voice_part: (member?.voice_part || '混声') as VoicePart,
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [borrowRecords, scores, members])

  const filteredRecords = useMemo(() => {
    return recordsWithInfo.filter((record) => {
      const matchesSearch =
        record.score_name.toLowerCase().includes(searchText.toLowerCase()) ||
        record.member_name.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = statusFilter ? record.status === statusFilter : true
      return matchesSearch && matchesStatus
    })
  }, [recordsWithInfo, searchText, statusFilter])

  const columns = [
    {
      key: 'score_name',
      title: '曲名',
      render: (row: BorrowRecordWithInfo) => (
        <div className="font-medium text-gray-900">{row.score_name}</div>
      ),
    },
    {
      key: 'member_name',
      title: '借阅人',
      render: (row: BorrowRecordWithInfo) => (
        <div>
          <p className="text-gray-900">{row.member_name}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${voicePartColors[row.member_voice_part]}`}
          >
            {row.member_voice_part}
          </span>
        </div>
      ),
    },
    {
      key: 'member_voice_part',
      title: '声部',
      render: (row: BorrowRecordWithInfo) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${voicePartColors[row.member_voice_part]}`}
        >
          {row.member_voice_part}
        </span>
      ),
    },
    {
      key: 'rehearsal_date',
      title: '排练日期',
      render: (row: BorrowRecordWithInfo) => (
        <span className="text-gray-600">{formatDate(row.rehearsal_date)}</span>
      ),
    },
    {
      key: 'expected_return_date',
      title: '预计归还',
      render: (row: BorrowRecordWithInfo) => (
        <span className="text-gray-600">{formatDate(row.expected_return_date)}</span>
      ),
    },
    {
      key: 'actual_return_date',
      title: '实际归还',
      render: (row: BorrowRecordWithInfo) => (
        <span className="text-gray-600">{formatDate(row.actual_return_date)}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (row: BorrowRecordWithInfo) => (
        <Badge variant={statusColorMap[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: 'with_pencil_mark',
      title: '铅笔标记',
      render: (row: BorrowRecordWithInfo) => (
        <div className="flex items-center gap-1">
          {row.with_pencil_mark ? (
            <>
              <Pencil className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm text-gray-600">是</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">借阅记录</h2>
            <p className="text-sm text-gray-500">查看所有曲谱借阅记录，支持筛选和搜索</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索曲名或借阅人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <DataTable columns={columns} data={filteredRecords} />
        ) : (
          <Empty
            title="暂无借阅记录"
            description={
              searchText || statusFilter
                ? '没有找到匹配的记录，请尝试其他搜索条件'
                : '暂无借阅记录'
            }
            className="py-12"
          />
        )}
      </Card>
    </div>
  )
}

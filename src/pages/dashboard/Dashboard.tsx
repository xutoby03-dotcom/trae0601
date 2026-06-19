import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  AlertTriangle,
  FileX,
  Music,
  Printer,
  ArrowRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { useScoreStore } from '@/store/useScoreStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useBorrowStore } from '@/store/useBorrowStore'
import type { Score, BorrowRecord, VoicePart, BorrowStatus } from '@/types'
import { cn } from '@/lib/utils'

const voicePartIcons: Record<VoicePart, React.ElementType> = {
  女高音: Volume2,
  女低音: VolumeX,
  男高音: Mic,
  男低音: MicOff,
  混声: Music,
}

const voicePartColors: Record<VoicePart, string> = {
  女高音: 'bg-pink-100 text-pink-700',
  女低音: 'bg-purple-100 text-purple-700',
  男高音: 'bg-blue-100 text-blue-700',
  男低音: 'bg-indigo-100 text-indigo-700',
  混声: 'bg-green-100 text-green-700',
}

const borrowStatusColors: Record<BorrowStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  借阅中: 'info',
  已归还: 'success',
  逾期: 'danger',
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  gradientFrom: string
  gradientTo: string
  iconBg: string
}

function StatCard({ title, value, icon: Icon, gradientFrom, gradientTo, iconBg }: StatCardProps) {
  return (
    <Card hoverable className="overflow-hidden">
      <div className={cn('p-5 bg-gradient-to-br', gradientFrom, gradientTo)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-white text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  )
}

interface NextRehearsalPiece {
  name: string
  voice_part: VoicePart
  required_count: number
}

const mockNextRehearsal: NextRehearsalPiece[] = [
  { name: '黄河大合唱', voice_part: '混声', required_count: 10 },
  { name: '半个月亮爬上来', voice_part: '女高音', required_count: 5 },
  { name: '牧歌', voice_part: '男高音', required_count: 4 },
  { name: '茉莉花', voice_part: '女低音', required_count: 4 },
  { name: '游击队歌', voice_part: '混声', required_count: 8 },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { scores } = useScoreStore()
  const { members } = useMemberStore()
  const { borrowRecords } = useBorrowStore()

  const pendingReturnCount = useMemo(() => {
    return borrowRecords.filter(
      (record) => record.status === '借阅中' || record.status === '逾期'
    ).length
  }, [borrowRecords])

  const damagedScores = useMemo(() => {
    const scoreDamageMap = new Map<string, Score>()

    scores.forEach((score) => {
      if (score.status === '破损') {
        scoreDamageMap.set(score.id, score)
      }
    })

    borrowRecords.forEach((record) => {
      if ((record.has_damage || record.has_missing_pages) && record.status === '已归还') {
        const score = scores.find((s) => s.id === record.score_id)
        if (score && !scoreDamageMap.has(score.id)) {
          scoreDamageMap.set(score.id, score)
        }
      }
    })

    return Array.from(scoreDamageMap.values())
  }, [scores, borrowRecords])

  const missingVoiceParts = useMemo(() => {
    const memberCountByPart = members.reduce((acc, member) => {
      acc[member.voice_part] = (acc[member.voice_part] || 0) + 1
      return acc
    }, {} as Record<VoicePart, number>)

    const result: { voice_part: VoicePart; score_count: number; total_shortage: number }[] = []

    const parts: VoicePart[] = ['女高音', '女低音', '男高音', '男低音', '混声']
    parts.forEach((part) => {
      const partScores = scores.filter((s) => s.voice_part === part)
      const memberCount = memberCountByPart[part] || 0

      const shortScores = partScores.filter((score) => score.total_stock < memberCount)
      if (shortScores.length > 0) {
        const totalShortage = shortScores.reduce(
          (sum, score) => sum + (memberCount - score.total_stock),
          0
        )
        result.push({
          voice_part: part,
          score_count: shortScores.length,
          total_shortage: totalShortage,
        })
      }
    })

    return result
  }, [scores, members])

  const reprintCount = useMemo(() => {
    let count = 0

    borrowRecords.forEach((record) => {
      if (record.needs_reprint) {
        count++
      }
    })

    scores.forEach((score) => {
      if (score.status === '待重印') {
        count++
      }
    })

    return count
  }, [scores, borrowRecords])

  const reprintByVoicePart = useMemo(() => {
    const reprintMap = new Map<VoicePart, number>()

    scores.forEach((score) => {
      if (score.status === '待重印') {
        reprintMap.set(score.voice_part, (reprintMap.get(score.voice_part) || 0) + 1)
      }
    })

    borrowRecords.forEach((record) => {
      if (record.needs_reprint) {
        const score = scores.find((s) => s.id === record.score_id)
        if (score) {
          reprintMap.set(score.voice_part, (reprintMap.get(score.voice_part) || 0) + 1)
        }
      }
    })

    return Array.from(reprintMap.entries()).map(([voice_part, count]) => ({
      voice_part,
      count,
    }))
  }, [scores, borrowRecords])

  const pendingReturns = useMemo(() => {
    return borrowRecords
      .filter((record) => record.status === '借阅中' || record.status === '逾期')
      .slice(0, 8)
  }, [borrowRecords])

  const damagedScoreList = useMemo(() => {
    return damagedScores.slice(0, 5)
  }, [damagedScores])

  const getScoreName = (scoreId: string) => {
    return scores.find((s) => s.id === scoreId)?.name || '未知曲谱'
  }

  const getScoreVoicePart = (scoreId: string) => {
    return scores.find((s) => s.id === scoreId)?.voice_part || '混声'
  }

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || '未知队员'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const pendingReturnColumns = [
    {
      key: 'name',
      title: '曲名',
      render: (row: BorrowRecord) => (
        <span className="font-medium text-gray-900">{getScoreName(row.score_id)}</span>
      ),
    },
    {
      key: 'voice_part',
      title: '声部',
      render: (row: BorrowRecord) => {
        const part = getScoreVoicePart(row.score_id)
        const Icon = voicePartIcons[part]
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              voicePartColors[part]
            )}
          >
            <Icon className="w-3 h-3" />
            {part}
          </span>
        )
      },
    },
    {
      key: 'member',
      title: '借阅人',
      render: (row: BorrowRecord) => <span>{getMemberName(row.member_id)}</span>,
    },
    {
      key: 'borrow_date',
      title: '借阅日期',
      render: (row: BorrowRecord) => <span>{formatDate(row.rehearsal_date)}</span>,
    },
    {
      key: 'expected_return',
      title: '预计归还',
      render: (row: BorrowRecord) => <span>{formatDate(row.expected_return_date)}</span>,
    },
    {
      key: 'status',
      title: '状态',
      render: (row: BorrowRecord) => (
        <Badge variant={borrowStatusColors[row.status]}>{row.status}</Badge>
      ),
    },
  ]

  const damagedScoreColumns = [
    {
      key: 'name',
      title: '曲名',
      render: (row: Score) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: 'voice_part',
      title: '声部',
      render: (row: Score) => {
        const Icon = voicePartIcons[row.voice_part]
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              voicePartColors[row.voice_part]
            )}
          >
            <Icon className="w-3 h-3" />
            {row.voice_part}
          </span>
        )
      },
    },
    {
      key: 'damage_type',
      title: '损坏类型',
      render: (row: Score) => {
        const damageRecord = borrowRecords.find(
          (r) => r.score_id === row.id && (r.has_damage || r.has_missing_pages)
        )
        if (damageRecord) {
          const types = []
          if (damageRecord.has_damage) types.push('破损')
          if (damageRecord.has_missing_pages) types.push('缺页')
          return types.join('、') || '未知'
        }
        return row.status === '破损' ? '自然磨损' : '未知'
      },
    },
    {
      key: 'needs_reprint',
      title: '是否需重印',
      render: (row: Score) => {
        const needsReprint =
          row.status === '待重印' ||
          borrowRecords.some((r) => r.score_id === row.id && r.needs_reprint)
        return (
          <Badge variant={needsReprint ? 'warning' : 'default'}>
            {needsReprint ? '需重印' : '暂不需要'}
          </Badge>
        )
      },
    },
  ]

  return (
    <Layout title="合唱队曲谱管理看板" subtitle="快速掌握曲谱借阅和库存状态">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="待归还曲谱"
            value={pendingReturnCount}
            icon={Clock}
            gradientFrom="from-primary-600"
            gradientTo="to-primary-800"
            iconBg="bg-white/20"
          />
          <StatCard
            title="缺谱声部"
            value={missingVoiceParts.length}
            icon={AlertTriangle}
            gradientFrom="from-amber-500"
            gradientTo="to-amber-700"
            iconBg="bg-white/20"
          />
          <StatCard
            title="破损曲谱"
            value={damagedScores.length}
            icon={FileX}
            gradientFrom="from-rose-500"
            gradientTo="to-rose-700"
            iconBg="bg-white/20"
          />
          <StatCard
            title="下次排练曲目"
            value={mockNextRehearsal.length}
            icon={Music}
            gradientFrom="from-violet-500"
            gradientTo="to-violet-700"
            iconBg="bg-white/20"
          />
          <StatCard
            title="需加印数量"
            value={reprintCount}
            icon={Printer}
            gradientFrom="from-teal-500"
            gradientTo="to-teal-700"
            iconBg="bg-white/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">待归还曲谱</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/borrow')}
                    className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  >
                    查看全部
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {pendingReturns.length > 0 ? (
                  <DataTable columns={pendingReturnColumns} data={pendingReturns} />
                ) : (
                  <div className="py-8 text-center text-gray-500">暂无待归还曲谱</div>
                )}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <FileX className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">破损曲谱</h3>
                </div>
              </div>
              <div className="p-4">
                {damagedScoreList.length > 0 ? (
                  <DataTable columns={damagedScoreColumns} data={damagedScoreList} />
                ) : (
                  <div className="py-8 text-center text-gray-500">暂无破损曲谱</div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">缺谱声部统计</h3>
                </div>
              </div>
              <div className="p-5">
                {missingVoiceParts.length > 0 ? (
                  <div className="space-y-3">
                    {missingVoiceParts.map((item) => {
                      const Icon = voicePartIcons[item.voice_part]
                      return (
                        <div
                          key={item.voice_part}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center',
                                voicePartColors[item.voice_part]
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{item.voice_part}</p>
                              <p className="text-xs text-gray-500">{item.score_count} 首曲谱缺谱</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">
                              缺 {item.total_shortage} 册
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500">各声部曲谱库存充足</div>
                )}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Music className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">下次排练曲目</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {mockNextRehearsal.map((piece, index) => {
                    const Icon = voicePartIcons[piece.voice_part]
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-transparent rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{piece.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Icon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{piece.voice_part}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">
                            需 <span className="text-violet-600 font-bold">{piece.required_count}</span> 册
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Printer className="w-4 h-4 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">需加印统计</h3>
              </div>
              <Badge variant="warning" className="text-base px-3 py-1">
                共 {reprintCount} 册需加印
              </Badge>
            </div>
          </div>
          <div className="p-5">
            {reprintByVoicePart.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {reprintByVoicePart.map((item) => {
                  const Icon = voicePartIcons[item.voice_part]
                  return (
                    <div
                      key={item.voice_part}
                      className="p-4 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            voicePartColors[item.voice_part]
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="font-medium text-gray-700">{item.voice_part}</span>
                      </div>
                      <p className="text-2xl font-bold text-teal-700">
                        {item.count}
                        <span className="text-sm font-normal text-gray-500 ml-1">册</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">暂无需要加印的曲谱</div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}

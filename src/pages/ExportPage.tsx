import { useParams, useNavigate } from 'react-router-dom'
import { usePetStore } from '@/store'
import { RECORD_TYPE_CONFIG, type HealthRecordType } from '@/types'
import { ArrowLeft, Printer, Download, FileText } from 'lucide-react'

function calcAge(birthday: string): string {
  const birth = new Date(birthday)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }
  if (years > 0) return `${years}岁${months > 0 ? months + '个月' : ''}`
  return `${months}个月`
}

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pets, getPetRecords } = usePetStore()

  const pet = pets.find((p) => p.id === id)
  const records = id ? getPetRecords(id) : []
  const petRecords = records.filter((r) => r.petId === id)
  const petTotalCost = petRecords.reduce((sum, r) => sum + r.cost, 0)
  const costByType: Partial<Record<HealthRecordType, number>> = {}
  petRecords.forEach((r) => {
    costByType[r.type] = (costByType[r.type] || 0) + r.cost
  })

  const exportDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-warm-500 text-lg mb-4">宠物不存在</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    )
  }

  const speciesLabel = pet.species === 'cat' ? '猫' : '狗'

  return (
    <div className="animate-fade-in">
      <header className="no-print flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-warm-700" />
          </button>
          <h1 className="section-title">导出档案</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" />
            打印
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </header>

      <div className="print-area max-w-[210mm] mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-10 md:p-14">
          <div className="flex items-start justify-between mb-8 border-b-2 border-warm-200 pb-6">
            <div>
              <h1 className="font-serif text-3xl font-bold text-warm-800 mb-2">
                宠物健康档案
              </h1>
              <p className="text-warm-400 text-sm">导出日期：{exportDate}</p>
            </div>
            <div className="text-right">
              <FileText className="w-10 h-10 text-warm-200" />
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="flex-1">
              <h2 className="font-serif text-lg font-semibold text-warm-700 mb-4 border-b border-warm-100 pb-2">
                基本信息
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">姓名</span>
                  <span className="text-warm-800 font-medium">{pet.name}</span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">物种</span>
                  <span className="text-warm-800 font-medium">{speciesLabel}</span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">品种</span>
                  <span className="text-warm-800 font-medium">{pet.breed || '未知'}</span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">生日</span>
                  <span className="text-warm-800 font-medium">{pet.birthday || '未知'}</span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">年龄</span>
                  <span className="text-warm-800 font-medium">
                    {pet.birthday ? calcAge(pet.birthday) : '未知'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">体重</span>
                  <span className="text-warm-800 font-medium">
                    {pet.weight ? `${pet.weight} kg` : '未知'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">芯片号</span>
                  <span className="text-warm-800 font-medium">{pet.chipNumber || '无'}</span>
                </div>
                <div className="flex justify-between border-b border-warm-50 pb-2">
                  <span className="text-warm-400">医院</span>
                  <span className="text-warm-800 font-medium">{pet.hospital || '未知'}</span>
                </div>
              </div>
            </div>

            {pet.photo && (
              <div className="flex-shrink-0">
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="w-28 h-28 rounded-xl object-cover border-2 border-warm-200"
                />
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-lg font-semibold text-warm-700 mb-4 border-b border-warm-100 pb-2">
              健康时间线
            </h2>
            {petRecords.length === 0 ? (
              <p className="text-warm-400 text-sm text-center py-8">暂无健康记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-warm-50">
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium rounded-tl-lg">
                        日期
                      </th>
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium">类型</th>
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium">名称</th>
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium">医院</th>
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium">医生</th>
                      <th className="text-right py-2.5 px-3 text-warm-500 font-medium">费用</th>
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium">下次时间</th>
                      <th className="text-left py-2.5 px-3 text-warm-500 font-medium rounded-tr-lg">
                        备注
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {petRecords.map((record) => {
                      const config = RECORD_TYPE_CONFIG[record.type as HealthRecordType]
                      return (
                        <tr key={record.id} className="border-b border-warm-50">
                          <td className="py-2.5 px-3 text-warm-700">{record.date}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: config.bgColor, color: config.color }}
                            >
                              {config.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-warm-800 font-medium">{record.title}</td>
                          <td className="py-2.5 px-3 text-warm-600">{record.hospital || '-'}</td>
                          <td className="py-2.5 px-3 text-warm-600">{record.doctor || '-'}</td>
                          <td className="py-2.5 px-3 text-warm-800 text-right">
                            {record.cost > 0 ? `¥${record.cost}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-warm-500">{record.nextDate || '-'}</td>
                          <td className="py-2.5 px-3 text-warm-500 max-w-[120px] truncate">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-lg font-semibold text-warm-700 mb-4 border-b border-warm-100 pb-2">
              费用统计
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-warm-50 rounded-xl p-4">
                <p className="text-warm-400 text-xs mb-1">总费用</p>
                <p className="text-warm-800 text-2xl font-semibold">¥{petTotalCost.toFixed(2)}</p>
                <p className="text-warm-300 text-xs mt-1">共 {petRecords.length} 条记录</p>
              </div>
              <div className="bg-warm-50 rounded-xl p-4">
                <p className="text-warm-400 text-xs mb-2">分类统计</p>
                <div className="space-y-1.5">
                  {(Object.entries(costByType) as [HealthRecordType, number][]).map(
                    ([type, cost]) => {
                      const config = RECORD_TYPE_CONFIG[type]
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-warm-600">{config.label}</span>
                          </span>
                          <span className="text-warm-800 font-medium">¥{cost.toFixed(2)}</span>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-warm-100 pt-4 text-center">
            <p className="text-warm-300 text-xs">
              由宠物疫苗档案本生成 · {exportDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { buildExportData, generateChecklistText, copyToClipboard } from '../utils/exportUtils'
import { ArrowLeft, Printer, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function ExportPage() {
  const equipment = useStore((s) => s.equipment)
  const borrowRecords = useStore((s) => s.borrowRecords)
  const currentTrip = useStore((s) => s.currentTrip)
  const [copied, setCopied] = useState(false)

  if (!currentTrip || currentTrip.selectedEquipment.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="font-display text-lg mb-2">暂无露营行程数据</p>
          <Link to="/" className="text-forest-600 hover:underline text-sm">
            返回首页创建行程
          </Link>
        </div>
      </div>
    )
  }

  const rows = buildExportData(currentTrip.selectedEquipment, equipment, borrowRecords)

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = async () => {
    const text = generateChecklistText(rows, currentTrip.name, currentTrip.date)
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-700 text-white shadow-lg no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="font-display text-xl font-bold">出发前检查表</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="camp-btn-secondary text-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm flex items-center gap-1.5"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制分享'}
              </button>
              <button
                onClick={handlePrint}
                className="camp-btn-primary text-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                打印
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-cream-300 p-6 print-only-block">
          <div className="text-center mb-6 no-print">
            <h2 className="font-display text-2xl font-bold text-forest-600">🏕️ 露营出发前检查表</h2>
            <p className="text-sm text-gray-500 mt-1">
              行程：{currentTrip.name} · 日期：{currentTrip.date || '待定'}
            </p>
          </div>

          <div className="print-only mb-4 text-center">
            <h2 className="text-xl font-bold">🏕️ 露营出发前检查表</h2>
            <p className="text-sm mt-1">行程：{currentTrip.name} · 日期：{currentTrip.date || '待定'}</p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-forest-50">
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700 w-10">
                  ✓
                </th>
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700 w-8">
                  #
                </th>
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700">
                  装备名称
                </th>
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700 w-16">
                  分类
                </th>
                <th className="border border-cream-300 px-3 py-2 text-center text-xs font-semibold text-forest-700 w-12">
                  数量
                </th>
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700 w-20">
                  借用人
                </th>
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700 w-16">
                  状态
                </th>
                <th className="border border-cream-300 px-3 py-2 text-left text-xs font-semibold text-forest-700">
                  备注
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.index} className="hover:bg-cream-50 transition-colors">
                  <td className="border border-cream-300 px-3 py-2 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-cream-300" />
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-xs text-gray-500 text-center">
                    {row.index}
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-sm font-medium">
                    {row.name}
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-xs text-gray-500">
                    {row.category}
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-sm text-center">
                    {row.quantity}
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-xs">
                    {row.borrower}
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-xs">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        row.status === '逾期'
                          ? 'bg-sunset-50 text-sunset-500'
                          : row.status === '已借出'
                          ? 'bg-earth-100 text-earth-600'
                          : 'bg-forest-50 text-forest-600'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="border border-cream-300 px-3 py-2 text-xs text-gray-500">
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 no-print">
            <span>共 {rows.length} 项装备</span>
            <span>✅ 出发前请逐项确认</span>
          </div>
        </div>
      </main>
    </div>
  )
}

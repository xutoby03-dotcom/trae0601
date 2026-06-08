import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Check, X } from 'lucide-react'
import { usePropertyStore } from '@/lib/store'
import {
  calculateTotalScore,
  calculateAnnualCost,
  calculateDepositAmount,
  INSPECTION_CATEGORIES,
  RISK_TAG_LABELS,
} from '@/lib/types'
import { exportViewingRecords } from '@/lib/export'

import type { Property } from '@/lib/types'

type RowDef = {
  label: string
  getValue: (p: Property) => string | number
  numeric?: boolean
  lowerBetter?: boolean
  higherBetter?: boolean
}

const COLUMN_COLORS = ['#60A5FA', '#FACC15', '#F472B6']

export default function Compare() {
  const navigate = useNavigate()
  const { properties, compareIds, toggleCompare } = usePropertyStore()
  const [toast, setToast] = useState(false)

  const selectedProps = properties.filter((p) => compareIds.includes(p.id))

  const handleToggle = (id: string) => {
    if (!compareIds.includes(id) && compareIds.length >= 3) return
    toggleCompare(id)
  }

  const handleExport = () => {
    if (selectedProps.length === 0) return
    const text = exportViewingRecords(selectedProps)
    navigator.clipboard.writeText(text).then(() => {
      setToast(true)
      setTimeout(() => setToast(false), 2000)
    })
  }

  const rows: RowDef[] = [
    { label: '小区名称', getValue: (p) => p.community },
    { label: '月租金 (¥)', getValue: (p) => p.rent, numeric: true, lowerBetter: true },
    { label: '押付方式', getValue: (p) => p.depositType },
    { label: '面积 (㎡)', getValue: (p) => p.area },
    { label: '楼层', getValue: (p) => p.floor },
    { label: '朝向', getValue: (p) => p.orientation },
    { label: '通勤时间 (分钟)', getValue: (p) => p.commuteMinutes, numeric: true, lowerBetter: true },
    { label: '中介费 (¥)', getValue: (p) => p.agencyFee },
    { label: '综合评分', getValue: (p) => calculateTotalScore(p.inspections), numeric: true, higherBetter: true },
  ]

  const getBestIndex = (row: RowDef) => {
    if (!row.numeric || selectedProps.length < 2) return -1
    const values = selectedProps.map((p) => Number(row.getValue(p)))
    if (row.lowerBetter) {
      const min = Math.min(...values)
      return values.indexOf(min)
    }
    if (row.higherBetter) {
      const max = Math.max(...values)
      return values.indexOf(max)
    }
    return -1
  }

  const annualCosts = selectedProps.map((p) => calculateAnnualCost(p))
  const bestAnnualIdx =
    annualCosts.length >= 2 ? annualCosts.indexOf(Math.min(...annualCosts)) : -1

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">房源对比</h1>
        <button
          onClick={handleExport}
          disabled={selectedProps.length === 0}
          className="p-1.5 -mr-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 py-4 space-y-6">
        <section>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">选择房源（2-3套）</h2>
          {properties.length === 0 ? (
            <p className="text-zinc-500 text-sm">暂无房源数据</p>
          ) : (
            <div className="space-y-2">
              {properties.map((p) => {
                const checked = compareIds.includes(p.id)
                const disabled = !checked && compareIds.length >= 3
                return (
                  <div
                    key={p.id}
                    onClick={() => !disabled && handleToggle(p.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                      disabled
                        ? 'bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed'
                        : checked
                        ? 'bg-zinc-800 border-zinc-600 cursor-pointer'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <span className="text-sm">{p.community}</span>
                    <span className="text-xs text-zinc-500 ml-auto">¥{p.rent}/月</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {selectedProps.length >= 2 && (
          <>
            <section>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-sm border-collapse min-w-[480px]">
                  <thead>
                    <tr className="bg-zinc-800/80">
                      <th className="text-left px-3 py-2.5 font-medium text-zinc-400 sticky left-0 bg-zinc-800/95 z-[1] w-28 min-w-[7rem]">
                        维度
                      </th>
                      {selectedProps.map((p, i) => (
                        <th key={p.id} className="text-center px-3 py-2.5 font-medium" style={{ color: COLUMN_COLORS[i] }}>
                          {p.community}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => {
                      const bestIdx = getBestIndex(row)
                      return (
                        <tr key={row.label} className={ri % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/60'}>
                          <td className="px-3 py-2 text-zinc-400 sticky left-0 bg-inherit z-[1]">
                            {row.label}
                          </td>
                          {selectedProps.map((p, ci) => {
                            const val = row.getValue(p)
                            const isBest = ci === bestIdx && bestIdx !== -1
                            return (
                              <td
                                key={p.id}
                                className={`text-center px-3 py-2 ${isBest ? 'text-[#22C55E] font-semibold' : ''}`}
                              >
                                {row.numeric && typeof val === 'number' ? val.toLocaleString() : val}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    {INSPECTION_CATEGORIES.map((cat, ri) => {
                      const values = selectedProps.map((p) => {
                        const item = p.inspections.find((i) => i.category === cat.value)
                        return item ? item.score : 0
                      })
                      const hasAny = values.some((v) => v > 0)
                      const maxVal = Math.max(...values)
                      return (
                        <tr key={cat.value} className={ri % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/60'}>
                          <td className="px-3 py-2 text-zinc-400 sticky left-0 bg-inherit z-[1]">
                            {cat.label}
                          </td>
                          {selectedProps.map((p, ci) => {
                            const item = p.inspections.find((i) => i.category === cat.value)
                            const score = item ? item.score : 0
                            const isBest = hasAny && score === maxVal && score > 0 && values.filter((v) => v === maxVal).length === 1
                            return (
                              <td
                                key={p.id}
                                className={`text-center px-3 py-2 ${isBest ? 'text-[#22C55E] font-semibold' : !score ? 'text-zinc-600' : ''}`}
                              >
                                {score > 0 ? `${score}/5` : '-'}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    <tr className="bg-zinc-900/30">
                      <td className="px-3 py-2 text-zinc-400 sticky left-0 bg-inherit z-[1]">风险标签</td>
                      {selectedProps.map((p) => (
                        <td key={p.id} className="text-center px-3 py-2">
                          {p.riskTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {p.riskTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-500/15 text-red-400 border border-red-500/20"
                                >
                                  {RISK_TAG_LABELS[tag]}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-600">无</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-zinc-800/50 font-semibold">
                      <td className="px-3 py-3 text-zinc-300 sticky left-0 bg-zinc-800/80 z-[1]">
                        一年总成本 (¥)
                      </td>
                      {selectedProps.map((p, ci) => {
                        const cost = annualCosts[ci]
                        const isBest = ci === bestAnnualIdx && bestAnnualIdx !== -1
                        return (
                          <td
                            key={p.id}
                            className={`text-center px-3 py-3 text-base ${isBest ? 'text-[#22C55E]' : 'text-zinc-100'}`}
                          >
                            ¥{cost.toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-medium text-zinc-400 mb-3">年度成本明细</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedProps.map((p, ci) => {
                  const deposit = calculateDepositAmount(p.depositType, p.rent)
                  const annualCost = annualCosts[ci]
                  const isBest = ci === bestAnnualIdx && bestAnnualIdx !== -1
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl p-4 border ${
                        isBest ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium" style={{ color: COLUMN_COLORS[ci] }}>
                          {p.community}
                        </span>
                        {isBest && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E]">
                            最优
                          </span>
                        )}
                      </div>
                      <div className="font-['DM_Mono',monospace] text-2xl font-bold mb-3 text-zinc-50">
                        ¥{annualCost.toLocaleString()}
                      </div>
                      <div className="space-y-1 text-xs text-zinc-400">
                        <div className="flex justify-between">
                          <span>月租 × 12</span>
                          <span className="text-zinc-300">¥{(p.rent * 12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>押金</span>
                          <span className="text-zinc-300">¥{deposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>中介费</span>
                          <span className="text-zinc-300">¥{p.agencyFee.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {selectedProps.length < 2 && properties.length > 0 && (
          <p className="text-center text-zinc-500 text-sm py-8">请至少选择 2 套房源进行对比</p>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl text-sm z-50">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>已复制到剪贴板</span>
          <button onClick={() => setToast(false)} className="ml-1 text-zinc-500 hover:text-zinc-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

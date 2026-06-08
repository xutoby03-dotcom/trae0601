import { useState } from 'react'
import { Calculator as CalcIcon, Minus, Plus, Users } from 'lucide-react'
import { calculateCostPerPerson, formatCurrency } from '@/utils/cost'

interface CostCalculatorProps {
  defaultCost?: number
  defaultPeople?: number
}

export default function CostCalculator({ defaultCost = 100, defaultPeople = 2 }: CostCalculatorProps) {
  const [totalCost, setTotalCost] = useState(defaultCost)
  const [people, setPeople] = useState(defaultPeople)

  const perPerson = calculateCostPerPerson(totalCost, people)

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
          <CalcIcon className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-bold text-slate-800">费用计算器</h4>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">总费用</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTotalCost(Math.max(0, totalCost - 10))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 hover:text-orange-600 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
              <input
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value) || 0)}
                className="w-full text-center text-xl font-bold text-slate-800 bg-white border border-slate-200 rounded-xl py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <button
              onClick={() => setTotalCost(totalCost + 10)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 hover:text-orange-600 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">参与人数</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPeople(Math.max(1, people - 1))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 hover:text-orange-600 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-slate-800">{people}</span>
              <span className="text-sm text-slate-400">人</span>
            </div>
            <button
              onClick={() => setPeople(people + 1)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 hover:text-orange-600 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 text-center border border-orange-100">
        <p className="text-xs text-slate-400 mb-1">每人分摊</p>
        <p className="text-3xl font-bold text-orange-600">{formatCurrency(perPerson)}</p>
        <p className="text-xs text-slate-400 mt-1">
          {formatCurrency(totalCost)} ÷ {people}人 = {formatCurrency(perPerson)}/人
        </p>
      </div>
    </div>
  )
}

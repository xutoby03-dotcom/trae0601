import CostCalculator from '@/components/CostCalculator'
import { Calculator as CalcIcon } from 'lucide-react'

export default function Calculator() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">费用计算器</h1>
        <p className="text-sm text-slate-400 mt-0.5">快速估算每人分摊费用</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">
            <CalcIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">拼车费用分摊</h2>
            <p className="text-xs text-slate-400">输入总费用和人数，自动计算每人金额</p>
          </div>
        </div>
        <CostCalculator defaultCost={100} defaultPeople={3} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <h3 className="font-semibold text-slate-700 text-sm">分摊规则说明</h3>
        <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
          <p>• <span className="font-medium text-slate-700">均摊模式</span>：总费用 ÷ 参与人数（含车主），每人金额相同</p>
          <p>• <span className="font-medium text-slate-700">建议</span>：油费、过路费等直接费用纳入总费用计算</p>
          <p>• <span className="font-medium text-slate-700">提示</span>：建议在出发前确认好费用分摊方式，避免争议</p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import PlanForm from '@/components/PlanForm'
import ComparisonTable from '@/components/ComparisonTable'
import CostCards from '@/components/CostCards'
import NeedScoring from '@/components/NeedScoring'
import PitfallAlert from '@/components/PitfallAlert'
import ExportButton from '@/components/ExportButton'
import { usePlanStore } from '@/store/planStore'
import { cn } from '@/lib/utils'

type TabKey = 'input' | 'compare'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'input', label: '套餐录入' },
  { key: 'compare', label: '对比总览' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const { plans } = usePlanStore()

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a365d] text-lg">
                📡
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-[#1a365d]">
                  家庭网费套餐对比
                </h1>
                <p className="text-xs text-slate-400">
                  看清隐藏条件，算出真实成本
                </p>
              </div>
            </div>
            {plans.length > 0 && <ExportButton />}
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative px-5 py-3 text-sm font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'text-[#ff6b35]'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
                {tab.key === 'input' && plans.length > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b35] text-xs font-bold text-white">
                    {plans.length}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ff6b35]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === 'input' && <PlanForm />}

        {activeTab === 'compare' && (
          <div id="compare-content" className="space-y-8">
            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-20">
                <div className="mb-3 text-5xl">📋</div>
                <p className="text-base font-medium text-slate-500">
                  还没有录入套餐
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  请先在「套餐录入」中添加运营商套餐
                </p>
                <button
                  onClick={() => setActiveTab('input')}
                  className="mt-4 rounded-lg bg-[#ff6b35] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#e55a2b] active:scale-95"
                >
                  去录入
                </button>
              </div>
            ) : (
              <>
                <ComparisonTable />
                <CostCards />
                <NeedScoring />
                <PitfallAlert />
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        所有计算基于你录入的数据，仅供参考 · 请以运营商合同为准
      </footer>
    </div>
  )
}

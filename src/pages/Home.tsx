import GrindingForm from '@/components/GrindingForm'
import GranularityPanel from '@/components/GranularityPanel'
import SniffRating from '@/components/SniffRating'
import SpecLibrary from '@/components/SpecLibrary'
import RecordHistory from '@/components/RecordHistory'
import { Beaker } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F0C08] relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(184,134,11,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8860B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <SpecLibrary />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-700/60 to-amber-900/40 flex items-center justify-center border border-amber-600/30 shadow-[0_4px_20px_rgba(184,134,11,0.2)]">
              <Beaker className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              咖喱研磨粒度对照
            </h1>
          </div>
          <p className="text-amber-600/50 text-sm max-w-lg mx-auto leading-relaxed">
            记录研磨参数 · 对比粒度差异 · 评分香气特征 · 沉淀可复用规范
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
        </header>

        <GrindingForm />
        <GranularityPanel />
        <SniffRating />
        <RecordHistory />

        <footer className="text-center py-8 border-t border-amber-900/10 mt-8">
          <p className="text-amber-800/30 text-xs">香料研磨粒度对照系统 · 匠心研磨 规范传承</p>
        </footer>
      </div>
    </div>
  )
}

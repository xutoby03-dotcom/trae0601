import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, FlaskConical, Search } from "lucide-react"
import { useStore } from "@/store/useStore"
import SampleCard from "@/components/SampleCard"
import Navbar from "@/components/Navbar"
import { SUBSTRATE_OPTIONS } from "@/types"

export default function Home() {
  const navigate = useNavigate()
  const { samples, observations, deleteSample } = useStore()
  const [search, setSearch] = useState("")
  const [filterSubstrate, setFilterSubstrate] = useState("")

  const filtered = samples.filter((s) => {
    const matchSearch =
      !search ||
      s.brand.toLowerCase().includes(search.toLowerCase()) ||
      s.model.toLowerCase().includes(search.toLowerCase())
    const matchSubstrate = !filterSubstrate || s.substrate === filterSubstrate
    return matchSearch && matchSubstrate
  })

  return (
    <div className="min-h-screen bg-[#12122a]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-24">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#fafafa]">
            固化观察板
          </h1>
          <p className="mt-2 text-sm text-[#6b8f9e]">
            追踪每条密封胶样品的固化过程，记录收缩、气泡、发黄、霉点和附着力变化
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b8f9e]" />
            <input
              type="text"
              placeholder="搜索品牌或型号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#22223a]/80 py-2.5 pl-10 pr-4 text-sm text-[#fafafa] placeholder-[#555570] outline-none transition-colors focus:border-[#e8a838]/40"
            />
          </div>
          <select
            value={filterSubstrate}
            onChange={(e) => setFilterSubstrate(e.target.value)}
            className="rounded-xl border border-white/[0.06] bg-[#22223a]/80 px-4 py-2.5 text-sm text-[#a0a0b8] outline-none transition-colors focus:border-[#e8a838]/40"
          >
            <option value="">全部基材</option>
            {SUBSTRATE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 && samples.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e8a838]/10">
              <FlaskConical className="h-10 w-10 text-[#e8a838]/60" />
            </div>
            <h2 className="mt-6 font-serif text-xl font-semibold text-[#fafafa]">
              开始你的观察
            </h2>
            <p className="mt-2 text-sm text-[#6b8f9e]">
              添加第一条密封胶样品，追踪其固化过程
            </p>
            <button
              onClick={() => navigate("/sample/new")}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[#e8a838] px-6 py-3 text-sm font-semibold text-[#1a1a2e] transition-all hover:bg-[#d49530] hover:shadow-[0_4px_20px_rgba(232,168,56,0.3)]"
            >
              <Plus className="h-4 w-4" />
              添加样品
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((sample) => (
              <SampleCard
                key={sample.id}
                sample={sample}
                observations={observations.filter(
                  (o) => o.sampleId === sample.id
                )}
                onDelete={deleteSample}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && samples.length > 0 && (
          <div className="py-16 text-center text-sm text-[#6b8f9e]">
            没有找到匹配的样品
          </div>
        )}
      </main>

      {samples.length > 0 && (
        <button
          onClick={() => navigate("/sample/new")}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8a838] shadow-[0_4px_24px_rgba(232,168,56,0.4)] transition-all hover:bg-[#d49530] hover:shadow-[0_6px_32px_rgba(232,168,56,0.5)] hover:scale-105"
        >
          <Plus className="h-6 w-6 text-[#1a1a2e]" />
        </button>
      )}
    </div>
  )
}

import { Mountain, Link, Calendar } from "lucide-react";
import RecordForm from "@/components/RecordForm";
import RecordList from "@/components/RecordList";
import SummaryPanel from "@/components/SummaryPanel";

export default function Home() {
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-earth-50/50 to-olive-100/50">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          #3D5A45 0px,
          #3D5A45 1px,
          transparent 1px,
          transparent 12px
        ),
        repeating-linear-gradient(
          -45deg,
          #3D5A45 0px,
          #3D5A45 1px,
          transparent 1px,
          transparent 12px
        )`
      }} />

      <header className="relative bg-gradient-to-r from-olive-800 via-olive-700 to-olive-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
          white 0px,
          white 1px,
          transparent 1px,
          transparent 20px
        )`
        }} />

        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                <Mountain className="w-8 h-8 text-earth-300" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold tracking-wide">
                  绳结拉力练习系统
                </h1>
                <p className="text-olive-300 text-sm mt-0.5 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  户外社团训练记录与评估
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <Calendar className="w-4 h-4 text-earth-300" />
              <span className="text-sm text-olive-100">{today}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-1">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-earth-400/50 to-transparent" />
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
          <div className="lg:col-span-3">
            <RecordForm />
          </div>

          <div className="lg:col-span-5">
            <RecordList />
          </div>

          <div className="lg:col-span-4">
            <SummaryPanel />
          </div>
        </div>
      </main>

      <footer className="relative mt-auto py-4 text-center text-xs text-olive-500">
        <div className="flex items-center justify-center gap-2">
          <Link className="w-4 h-4 opacity-50" />
          <span>安全第一 · 熟能生巧</span>
          <Link className="w-4 h-4 opacity-50" />
        </div>
      </footer>
    </div>
  );
}

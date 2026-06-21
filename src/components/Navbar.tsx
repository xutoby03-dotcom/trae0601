import { useNavigate } from "react-router-dom"
import { FlaskConical, BarChart3 } from "lucide-react"

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#1a1a2e]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8a838]/15">
            <FlaskConical className="h-5 w-5 text-[#e8a838]" />
          </div>
          <span className="font-serif text-lg font-semibold tracking-wide text-[#fafafa]">
            密封胶固化观察板
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg px-4 py-2 text-sm text-[#a0a0b8] transition-colors hover:bg-white/5 hover:text-[#fafafa]"
          >
            观察板
          </button>
          <button
            onClick={() => navigate("/recommendations")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[#a0a0b8] transition-colors hover:bg-white/5 hover:text-[#fafafa]"
          >
            <BarChart3 className="h-4 w-4" />
            场景推荐
          </button>
        </div>
      </div>
    </nav>
  )
}

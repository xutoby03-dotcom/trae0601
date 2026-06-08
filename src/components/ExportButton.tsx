import { Download, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  exporting: boolean
  onExport: () => void
}

export default function ExportButton({ exporting, onExport }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={exporting}
      className="flex items-center gap-2 rounded-lg bg-[#1a365d] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0f2440] active:scale-95 disabled:opacity-60"
    >
      {exporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {exporting ? '正在生成...' : '导出对比图'}
    </button>
  )
}

import { useRef } from 'react'
import { usePlanStore } from '@/store/planStore'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function ExportButton() {
  const { plans } = usePlanStore()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (plans.length === 0) return

    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const element = document.getElementById('compare-content')
      if (!element) return

      const canvas = await html2canvas(element, {
        backgroundColor: '#f0f4f8',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `套餐对比_${new Date().toLocaleDateString('zh-CN')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  if (plans.length === 0) return null

  return (
    <button
      onClick={handleExport}
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

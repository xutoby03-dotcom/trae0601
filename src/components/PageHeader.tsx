import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, showBack, action }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-dark-900">{title}</h1>
          {subtitle && <p className="text-xs text-dark-700/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

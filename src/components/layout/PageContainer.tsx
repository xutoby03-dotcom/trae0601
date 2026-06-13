import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`flex-1 overflow-auto bg-slate-50 p-6 scrollbar-thin ${className}`}>
      {children}
    </div>
  )
}

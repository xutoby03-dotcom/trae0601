import { ReactNode } from 'react'
import Sidebar from './Sidebar'

export interface LayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-100 px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

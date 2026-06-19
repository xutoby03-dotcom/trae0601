import { useState } from 'react'
import { BookOpen, CheckCircle, FileText } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import BorrowForm from './BorrowForm'
import ReturnCheck from './ReturnCheck'
import BorrowRecords from './BorrowRecords'

type TabType = 'borrow' | 'return' | 'records'

interface TabItem {
  key: TabType
  label: string
  icon: React.ElementType
}

const tabs: TabItem[] = [
  { key: 'borrow', label: '借阅登记', icon: BookOpen },
  { key: 'return', label: '归还检查', icon: CheckCircle },
  { key: 'records', label: '借阅记录', icon: FileText },
]

export default function BorrowPage() {
  const [activeTab, setActiveTab] = useState<TabType>('borrow')

  return (
    <Layout title="借阅管理" subtitle="管理曲谱的借阅、归还和记录查询">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 inline-flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div>
          {activeTab === 'borrow' && <BorrowForm />}
          {activeTab === 'return' && <ReturnCheck />}
          {activeTab === 'records' && <BorrowRecords />}
        </div>
      </div>
    </Layout>
  )
}

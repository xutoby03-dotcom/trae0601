import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { PackagePlus, LogOut, Send } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import PageContainer from '@/components/layout/PageContainer'
import Modal from '@/components/common/Modal'
import Dashboard from '@/pages/Dashboard'
import Lockers from '@/pages/Lockers'
import Packages from '@/pages/Packages'
import CheckInForm from '@/components/package/CheckInForm'
import CheckOutForm from '@/components/package/CheckOutForm'
import UrgentReminderForm from '@/components/package/UrgentReminderForm'
import { useAppStore } from '@/store/useAppStore'

type ModalType = 'none' | 'check-in' | 'check-out' | 'urgent-reminder'

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '数据看板', subtitle: '快递代收柜运营总览与核心指标' },
  '/lockers': { title: '柜格档案', subtitle: '柜格信息管理与状态监控' },
  '/packages': { title: '包裹记录', subtitle: '所有包裹的收发完整记录' },
}

function AppContent() {
  const location = useLocation()
  const { getDashboardStats, refreshUrgentStatus } = useAppStore()
  const pageInfo = TITLES[location.pathname] || { title: '快递代收柜', subtitle: '' }
  const stats = getDashboardStats()

  const [modal, setModal] = useState<ModalType>('none')
  const [preLockerId, setPreLockerId] = useState<string | undefined>()
  const [prePackageId, setPrePackageId] = useState<string | undefined>()
  const [reminderPackageId, setReminderPackageId] = useState<string | undefined>()

  const openCheckIn = (lockerId?: string) => {
    setPreLockerId(lockerId)
    setPrePackageId(undefined)
    setReminderPackageId(undefined)
    setModal('check-in')
  }
  const openCheckOut = (packageId?: string) => {
    setPrePackageId(packageId)
    setPreLockerId(undefined)
    setReminderPackageId(undefined)
    setModal('check-out')
  }
  const openUrgentReminder = (packageId: string) => {
    setReminderPackageId(packageId)
    setPreLockerId(undefined)
    setPrePackageId(undefined)
    setModal('urgent-reminder')
  }
  const closeModal = () => {
    setModal('none')
    setPreLockerId(undefined)
    setPrePackageId(undefined)
    setReminderPackageId(undefined)
    refreshUrgentStatus()
  }

  const handleQuickAction = (action: 'check-in' | 'check-out') => {
    if (action === 'check-in') openCheckIn()
    else openCheckOut()
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar onQuickAction={handleQuickAction} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onRefresh={refreshUrgentStatus}
          urgentCount={stats.urgentPackages}
          refrigeratedCount={stats.refrigeratedPackages.length}
        />

        <PageContainer>
          <Routes>
            <Route path="/" element={<Dashboard onCheckIn={openCheckIn} onCheckOut={openCheckOut} onAddReminder={openUrgentReminder} />} />
            <Route path="/lockers" element={<Lockers onCheckInFromLocker={openCheckIn} />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="*" element={<Dashboard onCheckIn={openCheckIn} onCheckOut={openCheckOut} onAddReminder={openUrgentReminder} />} />
          </Routes>
        </PageContainer>
      </div>

      <Modal
        isOpen={modal === 'check-in'}
        onClose={closeModal}
        title="包裹入柜登记"
        icon={<PackagePlus size={20} />}
        size="lg"
      >
        <CheckInForm
          preSelectedLockerId={preLockerId}
          onSubmit={closeModal}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modal === 'check-out'}
        onClose={closeModal}
        title="包裹取件验证"
        icon={<LogOut size={20} />}
        size="lg"
      >
        <CheckOutForm
          preSelectedPackageId={prePackageId}
          onSubmit={closeModal}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modal === 'urgent-reminder'}
        onClose={closeModal}
        title="登记催取记录"
        icon={<Send size={20} />}
        size="md"
      >
        {reminderPackageId && (
          <UrgentReminderForm
            packageId={reminderPackageId}
            onClose={closeModal}
            onDone={refreshUrgentStatus}
          />
        )}
      </Modal>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

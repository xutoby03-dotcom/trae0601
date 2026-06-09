import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Plus } from 'lucide-react'
import type { PhoneGroup } from '@/types'
import { usePhoneStore } from '@/store'
import GroupTabs from '@/components/GroupTabs'
import PhoneCard from '@/components/PhoneCard'

export default function Home() {
  const navigate = useNavigate()
  const phones = usePhoneStore((s) => s.phones)
  const [activeGroup, setActiveGroup] = useState<PhoneGroup>('recyclable')

  const counts = {
    recyclable: phones.filter((p) => p.group === 'recyclable').length,
    backup: phones.filter((p) => p.group === 'backup').length,
    parts: phones.filter((p) => p.group === 'parts').length,
  }

  const filteredPhones = phones.filter((p) => p.group === activeGroup)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-[#1B4332] px-5 pb-6 pt-12">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: '"Noto Serif SC", serif' }}
        >
          旧手机回收估价册
        </h1>
        <p className="mt-1 text-sm text-[#52B788]">清点抽屉里的老手机</p>
      </header>

      <div className="px-5 pt-4">
        <GroupTabs
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
          counts={counts}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 px-5">
        {filteredPhones.length > 0 ? (
          filteredPhones.map((phone) => (
            <PhoneCard key={phone.id} phone={phone} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Smartphone className="h-12 w-12" />
            <p className="mt-3 text-sm">还没添加手机</p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] text-white shadow-lg active:scale-95 transition-transform z-10"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}

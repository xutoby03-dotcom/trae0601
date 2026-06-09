import { useNavigate } from 'react-router-dom'
import { NotebookPen, Search } from 'lucide-react'
import { useState } from 'react'
import { useLoanStore } from '@/store/loanStore'
import GroupSection, { ExpiringSoonIcon, OverdueIcon, InstallmentIcon, ActiveIcon, SettledIcon } from '@/components/GroupSection'

export default function Home() {
  const { getLoansByGroup, loans } = useLoanStore()
  const groups = getLoansByGroup()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = (list: typeof loans) =>
    search
      ? list.filter(
          (l) =>
            l.borrowerName.includes(search) ||
            l.purpose.includes(search) ||
            l.note.includes(search)
        )
      : list

  const totalActive = groups.overdue.length + groups.expiringSoon.length + groups.installment.length + groups.active.length

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-apricot-900 text-2xl flex items-center gap-2">
            <NotebookPen size={24} className="text-apricot-400" />
            借钱备忘
          </h1>
          <p className="text-parchment-500 text-xs mt-0.5">借出去的钱，心里有数</p>
        </div>
        {totalActive > 0 && (
          <div className="bg-coral-100 text-coral-500 text-xs font-bold px-2.5 py-1 rounded-full">
            {totalActive} 笔未结
          </div>
        )}
      </div>

      {loans.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名、用途..."
            className="w-full pl-9 pr-3 py-2.5 bg-white/80 border border-parchment-200 rounded-xl text-apricot-900 text-sm focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all placeholder:text-parchment-400"
          />
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📒</div>
          <h2 className="font-display font-bold text-apricot-800 text-lg mb-2">还没有借款记录</h2>
          <p className="text-parchment-500 text-sm mb-6">点击下方 + 记录第一笔借款吧</p>
          <button
            onClick={() => navigate('/loan/new')}
            className="px-6 py-2.5 bg-apricot-400 hover:bg-apricot-500 text-white font-display font-bold rounded-xl shadow-warm hover:shadow-warm-md transition-all active:scale-95"
          >
            新增借款
          </button>
        </div>
      ) : (
        <>
          <GroupSection
            title="已逾期"
            icon={<OverdueIcon />}
            loans={filtered(groups.overdue)}
            variant="overdue"
            defaultOpen={true}
            accentColor="bg-coral-100"
          />
          <GroupSection
            title="快到期"
            icon={<ExpiringSoonIcon />}
            loans={filtered(groups.expiringSoon)}
            variant="expiring"
            defaultOpen={groups.overdue.length === 0}
            accentColor="bg-sage-100"
          />
          <GroupSection
            title="分期还款"
            icon={<InstallmentIcon />}
            loans={filtered(groups.installment)}
            variant="installment"
            defaultOpen={groups.overdue.length === 0 && groups.expiringSoon.length === 0}
            accentColor="bg-apricot-100"
          />
          <GroupSection
            title="进行中"
            icon={<ActiveIcon />}
            loans={filtered(groups.active)}
            variant="active"
            defaultOpen={false}
            accentColor="bg-parchment-200"
          />
          <GroupSection
            title="已结清"
            icon={<SettledIcon />}
            loans={filtered(groups.settled)}
            variant="settled"
            defaultOpen={false}
            accentColor="bg-sage-100"
          />
        </>
      )}
    </div>
  )
}

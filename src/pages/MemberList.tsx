import { Link } from 'react-router-dom'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { PERSON_ROLE_CONFIG } from '@/types/insurance'
import { User, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react'

function formatCoverage(amount: number): string {
  return amount >= 10000
    ? `${(amount / 10000).toFixed(1)}亿元`
    : `${amount.toLocaleString()}万元`
}

export default function MemberList() {
  const {
    getInsuredPersons,
    getPersonPolicies,
    getPersonGaps,
    getPersonOverlaps,
    getPersonCoverageAmount,
    getPolicyStatus,
    getPersonRole,
  } = useInsuranceStore()

  const persons = getInsuredPersons()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--navy-900)]">家庭成员</h1>
        <p className="text-sm text-gray-500 mt-1">共 {persons.length} 位被保人</p>
      </div>

      {persons.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">暂无被保人，请先添加保单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {persons.map((name, index) => {
            const policies = getPersonPolicies(name)
            const activeCount = policies.filter(
              (p) => getPolicyStatus(p) !== '已失效'
            ).length
            const coverageAmount = getPersonCoverageAmount(name)
            const gaps = getPersonGaps(name)
            const overlaps = getPersonOverlaps(name)
            const role = getPersonRole(name)
            const roleCfg = PERSON_ROLE_CONFIG[role]

            return (
              <Link
                key={name}
                to={`/members/${encodeURIComponent(name)}`}
                className="card block p-5 animate-fade-in hover:border-[var(--navy-200)]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--navy-50)] flex items-center justify-center">
                      <User className="w-6 h-6 text-[var(--navy-500)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[var(--navy-900)]">{name}</h2>
                        <span className={`badge ${roleCfg.bg} ${roleCfg.color} border`}>
                          {roleCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          {activeCount} 份有效保单
                        </span>
                        <span className="text-sm text-gray-400">|</span>
                        <span className="text-sm font-medium text-[var(--navy-600)]">
                          总保额 {formatCoverage(coverageAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(gaps.length > 0 || overlaps.length > 0) && (
                      <div className="flex items-center gap-2">
                        {gaps.length > 0 && (
                          <span className="badge bg-red-50 text-red-600 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            {gaps.length} 项缺口
                          </span>
                        )}
                        {overlaps.length > 0 && (
                          <span className="badge bg-amber-50 text-amber-600 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            {overlaps.length} 项重叠
                          </span>
                        )}
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

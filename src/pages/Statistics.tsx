import { useInsuranceStore } from '@/stores/insuranceStore'
import { INSURANCE_TYPE_COLORS, STATUS_CONFIG } from '@/types/insurance'
import type { InsuranceType } from '@/types/insurance'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, ShieldCheck, Users, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { differenceInDays, parseISO, format } from 'date-fns'

const SUMMARY_CARDS = [
  { key: 'premium', label: '年保费总额', icon: DollarSign, border: 'border-l-amber-500', iconBg: 'bg-amber-50 text-amber-600' },
  { key: 'active', label: '有效保单数', icon: ShieldCheck, border: 'border-l-emerald-500', iconBg: 'bg-emerald-50 text-emerald-600' },
  { key: 'persons', label: '被保人数', icon: Users, border: 'border-l-blue-500', iconBg: 'bg-blue-50 text-blue-600' },
  { key: 'expiring', label: '即将到期', icon: Clock, border: 'border-l-orange-500', iconBg: 'bg-orange-50 text-orange-600' },
] as const

export default function Statistics() {
  const { policies, getPolicyStatus, getInsuredPersons, getPersonCoverageAmount, getTotalAnnualPremium, getExpiringPolicies } = useInsuranceStore()

  const activePolicies = policies.filter((p) => getPolicyStatus(p) !== '已失效')
  const expiringPolicies = getExpiringPolicies(90)
  const persons = getInsuredPersons()
  const totalPremium = getTotalAnnualPremium()

  const summaryValues: Record<string, string | number> = {
    premium: `${totalPremium.toLocaleString()} 元`,
    active: activePolicies.length,
    persons: persons.length,
    expiring: expiringPolicies.length,
  }

  const premiumByType = Object.entries(
    activePolicies.reduce<Record<string, number>>((acc, p) => {
      acc[p.insuranceType] = (acc[p.insuranceType] || 0) + p.premium
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const coverageByPerson = persons.map((name) => ({
    name,
    coverage: getPersonCoverageAmount(name),
  }))

  if (policies.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-gray-400">
        <ShieldCheck className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">暂无保单数据</p>
        <p className="text-sm mt-1">添加保单后即可查看统计分析</p>
        <Link to="/policy/new" className="btn-primary mt-6">
          添加保单
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map(({ key, label, icon: Icon, border, iconBg }) => (
          <div key={key} className={`stat-card ${border} border-l-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summaryValues[key]}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-4">保费分布（按险种）</h2>
          {premiumByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={premiumByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {premiumByType.map((entry) => (
                    <Cell key={entry.name} fill={INSURANCE_TYPE_COLORS[entry.name as InsuranceType]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()} 元`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              暂无有效保单
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-4">保额分布（按被保人）</h2>
          {coverageByPerson.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coverageByPerson}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value} 万元`} />
                <Legend />
                <Bar dataKey="coverage" name="保额（万元）" fill="var(--navy-600)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              暂无被保人数据
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-4">即将到期保单（90天内）</h2>
        {expiringPolicies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left py-3 px-2 font-medium">被保人</th>
                  <th className="text-left py-3 px-2 font-medium">险种</th>
                  <th className="text-left py-3 px-2 font-medium">保险公司</th>
                  <th className="text-left py-3 px-2 font-medium">到期日期</th>
                  <th className="text-left py-3 px-2 font-medium">剩余天数</th>
                  <th className="text-left py-3 px-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {expiringPolicies
                  .sort((a, b) => differenceInDays(parseISO(a.expiryDate), new Date()) - differenceInDays(parseISO(b.expiryDate), new Date()))
                  .map((policy) => {
                    const daysLeft = differenceInDays(parseISO(policy.expiryDate), new Date())
                    const status = getPolicyStatus(policy)
                    const statusCfg = STATUS_CONFIG[status]
                    return (
                      <tr key={policy.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-2 font-medium text-gray-900">{policy.insuredPerson}</td>
                        <td className="py-3 px-2">
                          <span
                            className="badge text-white"
                            style={{ backgroundColor: INSURANCE_TYPE_COLORS[policy.insuranceType] }}
                          >
                            {policy.insuranceType}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600">{policy.company}</td>
                        <td className="py-3 px-2 text-gray-600">{format(parseISO(policy.expiryDate), 'yyyy-MM-dd')}</td>
                        <td className="py-3 px-2">
                          <span className={`font-semibold ${daysLeft <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
                            {daysLeft} 天
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`badge ${statusCfg.bg} ${statusCfg.color} border`}>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            暂无即将到期的保单
          </div>
        )}
      </div>
    </div>
  )
}

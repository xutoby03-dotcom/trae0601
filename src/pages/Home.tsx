import { useInsuranceStore } from '@/stores/insuranceStore'
import { STATUS_CONFIG, INSURANCE_TYPE_COLORS, PERSON_ROLE_CONFIG } from '@/types/insurance'
import type { InsurancePolicy, PolicyStatus } from '@/types/insurance'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, ShieldCheck, ShieldOff, Plus, BarChart3, ChevronRight, Shield, Heart } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'

const STATUS_ICONS: Record<PolicyStatus, React.ReactNode> = {
  '快缴费': <Clock className="w-5 h-5 text-orange-600" />,
  '快到期': <AlertTriangle className="w-5 h-5 text-amber-600" />,
  '保障中': <ShieldCheck className="w-5 h-5 text-emerald-600" />,
  '已失效': <ShieldOff className="w-5 h-5 text-gray-400" />,
}

const STATUS_ORDER: PolicyStatus[] = ['快缴费', '快到期', '保障中', '已失效']

function formatMoney(amount: number, unit: '元' | '万元' = '元'): string {
  if (unit === '万元') {
    return amount >= 10000
      ? `${(amount / 10000).toFixed(1)}亿元`
      : `${amount.toLocaleString()}万元`
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万元`
  }
  return `${amount.toLocaleString()}元`
}

function PolicyCard({ policy }: { policy: InsurancePolicy }) {
  const status = useInsuranceStore((s) => s.getPolicyStatus(policy))
  const config = STATUS_CONFIG[status]
  const daysToExpiry = differenceInDays(parseISO(policy.expiryDate), new Date())
  const daysToPayment = differenceInDays(parseISO(policy.paymentDate), new Date())

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="badge text-white"
            style={{ backgroundColor: INSURANCE_TYPE_COLORS[policy.insuranceType] }}
          >
            {policy.insuranceType}
          </span>
          <span className={`badge ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        {(status === '快到期' || status === '快缴费') && (
          <span className="text-xs text-red-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {status === '快缴费'
              ? `${daysToPayment}天后缴费`
              : `剩${daysToExpiry}天`}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">被保人</span>
          <span className="font-medium">{policy.insuredPerson}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">保险公司</span>
          <span className="font-medium">{policy.company}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">保额</span>
          <span className="font-semibold" style={{ color: 'var(--navy-700)' }}>
            {formatMoney(policy.coverageAmount, '万元')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">保费</span>
          <span className="font-medium">{formatMoney(policy.premium)}/年</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">
            {status === '快缴费' ? '缴费日' : '到期日'}
          </span>
          <span className="font-medium">
            {status === '快缴费' ? policy.paymentDate : policy.expiryDate}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link
          to={`/policy/${policy.id}`}
          className="flex items-center justify-center gap-1 text-sm font-medium hover:underline"
          style={{ color: 'var(--navy-600)' }}
        >
          查看详情
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const getGroupedPolicies = useInsuranceStore((s) => s.getGroupedPolicies)
  const getInsuredPersons = useInsuranceStore((s) => s.getInsuredPersons)
  const getPersonGaps = useInsuranceStore((s) => s.getPersonGaps)
  const getPersonOverlaps = useInsuranceStore((s) => s.getPersonOverlaps)
  const getExpiringPolicies = useInsuranceStore((s) => s.getExpiringPolicies)
  const getElderlyExpiringMedical = useInsuranceStore((s) => s.getElderlyExpiringMedical)
  const getTotalAnnualPremium = useInsuranceStore((s) => s.getTotalAnnualPremium)
  const getPersonRole = useInsuranceStore((s) => s.getPersonRole)
  const policies = useInsuranceStore((s) => s.policies)

  const grouped = getGroupedPolicies()
  const persons = getInsuredPersons()
  const expiring = getExpiringPolicies(30)
  const totalPremium = getTotalAnnualPremium()
  const elderlyExpiringMedical = getElderlyExpiringMedical(90)

  const gapsList = persons
    .map((name) => ({ name, role: getPersonRole(name), gaps: getPersonGaps(name) }))
    .filter((item) => item.gaps.length > 0)

  const overlapsList = persons
    .map((name) => ({ name, overlaps: getPersonOverlaps(name) }))
    .filter((item) => item.overlaps.length > 0)

  const hasAlerts = expiring.length > 0 || gapsList.length > 0 || overlapsList.length > 0 || elderlyExpiringMedical.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy-900)' }}>
            家庭保单管理
          </h1>
          {policies.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              共 {policies.length} 份保单，年缴保费 {formatMoney(totalPremium)}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2" onClick={() => navigate('/statistics')}>
            <BarChart3 className="w-4 h-4" />
            统计分析
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/policy/new')}>
            <Plus className="w-4 h-4" />
            添加保单
          </button>
        </div>
      </div>

      {hasAlerts && (
        <div className="space-y-3 animate-fade-in">
          {expiring.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {expiring.length} 份保单将在30天内到期
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {expiring.map((p) => `${p.insuredPerson}的${p.insuranceType}`).join('、')}
                </p>
              </div>
            </div>
          )}

          {gapsList.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <Shield className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">存在保障缺口</p>
                {gapsList.map((item) => {
                  const roleCfg = PERSON_ROLE_CONFIG[item.role]
                  return (
                    <p key={item.name} className="text-xs text-red-600 mt-1">
                      <span className={`badge ${roleCfg.bg} ${roleCfg.color} border text-xs mr-1`}>
                        {roleCfg.label}
                      </span>
                      {item.name} 缺少：{item.gaps.join('、')}
                    </p>
                  )
                })}
              </div>
            </div>
          )}

          {elderlyExpiringMedical.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
              <Heart className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-purple-800">老人医疗险即将到期</p>
                {elderlyExpiringMedical.map(({ policy, days }) => (
                  <p key={policy.id} className="text-xs text-purple-600 mt-1">
                    {policy.insuredPerson} 的{policy.company}医疗险，剩余 {days} 天到期，请及时续费
                  </p>
                ))}
              </div>
            </div>
          )}

          {overlapsList.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
              <Shield className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-800">存在重复保障</p>
                {overlapsList.map((item) => (
                  <p key={item.name} className="text-xs text-orange-600 mt-1">
                    {item.name} 重复：{item.overlaps.join('、')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {policies.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in">
          <Shield className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">暂无保单</h3>
          <p className="mt-2 text-sm text-gray-500">添加您的第一份保单，开始管理家庭保障</p>
          <button
            className="btn-primary mt-6 inline-flex items-center gap-2"
            onClick={() => navigate('/policy/new')}
          >
            <Plus className="w-4 h-4" />
            添加保单
          </button>
        </div>
      ) : (
        STATUS_ORDER.map((status) => {
          const list = grouped[status]
          if (list.length === 0) return null
          const config = STATUS_CONFIG[status]

          return (
            <section key={status} className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                {STATUS_ICONS[status]}
                <h2 className="section-title">{config.label}</h2>
                <span className={`badge ${config.bg} ${config.color}`}>
                  {list.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

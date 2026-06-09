import { useParams, useNavigate } from 'react-router-dom'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { INSURANCE_TYPES, INSURANCE_TYPE_COLORS, STATUS_CONFIG, PERSON_ROLE_CONFIG } from '@/types/insurance'
import type { InsuranceType, InsurancePolicy, PersonRole } from '@/types/insurance'
import { ArrowLeft, AlertTriangle, ShieldCheck, ShieldOff, Copy, Heart } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'

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

type CellStatus = 'active' | 'gap' | 'overlap' | 'inactive'

const CELL_STATUS_STYLE: Record<CellStatus, { bg: string; label: string }> = {
  active: { bg: 'bg-emerald-400', label: '有保障' },
  gap: { bg: 'bg-red-400', label: '缺口' },
  overlap: { bg: 'bg-amber-400', label: '重叠' },
  inactive: { bg: 'bg-gray-200', label: '不适用' },
}

function PolicyCard({ policy, status, muted }: { policy: InsurancePolicy; status: string; muted?: boolean }) {
  const statusCfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  const daysToExpiry = differenceInDays(parseISO(policy.expiryDate), new Date())

  return (
    <div
      className={`card p-4 ${muted ? 'opacity-60' : ''}`}
      style={muted ? { borderColor: '#e5e7eb' } : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-gray-900">{policy.company}</span>
          <span
            className="badge ml-2"
            style={{
              backgroundColor: INSURANCE_TYPE_COLORS[policy.insuranceType] + '18',
              color: INSURANCE_TYPE_COLORS[policy.insuranceType],
              border: `1px solid ${INSURANCE_TYPE_COLORS[policy.insuranceType]}30`,
            }}
          >
            {policy.insuranceType}
          </span>
        </div>
        <span className={`badge ${statusCfg.bg} ${statusCfg.color} border`}>{statusCfg.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-3">
        <div>
          <span className="text-gray-400">保额</span>
          <p className="font-medium text-gray-700">{formatMoney(policy.coverageAmount, '万元')}</p>
        </div>
        <div>
          <span className="text-gray-400">保费</span>
          <p className="font-medium text-gray-700">{formatMoney(policy.premium)}/年</p>
        </div>
        <div>
          <span className="text-gray-400">到期日</span>
          <p className="font-medium text-gray-700">{policy.expiryDate}</p>
        </div>
        <div>
          <span className="text-gray-400">代理人</span>
          <p className={`font-medium ${policy.agent ? 'text-gray-700' : 'text-gray-400 italic'}`}>{policy.agent || '未填写'}</p>
        </div>
      </div>
      {!muted && daysToExpiry >= 0 && daysToExpiry <= 30 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>将于 {daysToExpiry} 天后到期</span>
        </div>
      )}
    </div>
  )
}

export default function MemberDetail() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const {
    getPersonPolicies,
    getPersonGaps,
    getPersonOverlaps,
    getPersonCoverageAmount,
    getPolicyStatus,
    getPersonRole,
  } = useInsuranceStore()

  if (!name) return null

  const decodedName = decodeURIComponent(name)
  const policies = getPersonPolicies(decodedName)
  const gaps = getPersonGaps(decodedName)
  const overlaps = getPersonOverlaps(decodedName)
  const coverageAmount = getPersonCoverageAmount(decodedName)
  const role = getPersonRole(decodedName)
  const roleCfg = PERSON_ROLE_CONFIG[role]

  const activePolicies = policies.filter((p) => getPolicyStatus(p) !== '已失效')
  const expiredPolicies = policies.filter((p) => getPolicyStatus(p) === '已失效')

  const activeTypeSet = new Set(activePolicies.map((p) => p.insuranceType))
  const overlapSet = new Set(overlaps)

  function getCellStatus(type: InsuranceType): CellStatus {
    if (overlapSet.has(type) && activeTypeSet.has(type)) return 'overlap'
    if (activeTypeSet.has(type)) return 'active'
    if (gaps.includes(type)) return 'gap'
    return 'inactive'
  }

  function getGapSuggestion(type: InsuranceType): { text: string; urgent: boolean } {
    if (role === '孩子') {
      if (type === '意外险') return { text: '孩子活泼好动，意外风险高，意外险保费低保障高，强烈建议补充', urgent: true }
      if (type === '重疾险') return { text: '少儿重疾发病率逐年上升，确诊即赔可减轻家庭负担', urgent: false }
      if (type === '医疗险') return { text: '建议补充医疗险，覆盖日常住院及门诊费用', urgent: false }
    }
    if (role === '老人') {
      if (type === '医疗险') return { text: '老人就医频率高，医疗险是刚需保障，强烈建议补充', urgent: true }
      if (type === '重疾险') return { text: '老年人重疾风险显著升高，建议补充重疾保障', urgent: false }
      if (type === '意外险') return { text: '老年人骨折等意外风险较高，建议补充意外保障', urgent: false }
    }
    return {
      '重疾险': { text: '重大疾病保障缺失，确诊即赔可减轻经济负担', urgent: false },
      '医疗险': { text: '建议补充医疗险，覆盖日常住院及门诊费用', urgent: false },
      '意外险': { text: '意外风险不可预测，保费低保障高建议补充', urgent: false },
    }[type] || { text: '建议补充该类型保障', urgent: false }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[var(--navy-50)] flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--navy-600)]">
                {decodedName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--navy-900)]">{decodedName}</h1>
                <span className={`badge ${roleCfg.bg} ${roleCfg.color} border`}>
                  {roleCfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {activePolicies.length} 份有效保单 · 总保额 {formatMoney(coverageAmount, '万元')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <h2 className="section-title mb-4">保障矩阵</h2>
        <div className="card p-5">
          <div className="grid grid-cols-5 gap-3">
            {INSURANCE_TYPES.map((type) => {
              const status = getCellStatus(type)
              const style = CELL_STATUS_STYLE[status]
              return (
                <div key={type} className="text-center">
                  <div
                    className={`${style.bg} rounded-lg h-20 flex flex-col items-center justify-center mb-2 transition-all`}
                  >
                    {status === 'active' && <ShieldCheck className="w-5 h-5 text-white mb-1" />}
                    {status === 'gap' && <ShieldOff className="w-5 h-5 text-white mb-1" />}
                    {status === 'overlap' && <Copy className="w-5 h-5 text-white mb-1" />}
                    {status === 'inactive' && <span className="w-5 h-5 mb-1" />}
                    <span className="text-xs font-medium text-white/90">{style.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-emerald-400" /> 有保障
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-red-400" /> 缺口
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-amber-400" /> 重叠
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-gray-200" /> 不适用
            </span>
          </div>
        </div>
      </section>

      {gaps.length > 0 && (
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '160ms' }}>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            保障缺口
          </h2>
          <div className="space-y-3">
            {gaps.map((type) => {
              const suggestion = getGapSuggestion(type)
              return (
                <div
                  key={type}
                  className={`card p-4 ${suggestion.urgent ? 'border-red-300 bg-red-50/70' : 'border-red-200 bg-red-50/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldOff className={`w-5 h-5 shrink-0 ${suggestion.urgent ? 'text-red-500' : 'text-red-400'}`} />
                    <div>
                      <p className={`font-medium ${suggestion.urgent ? 'text-red-800' : 'text-red-700'}`}>
                        缺少{type}
                        {suggestion.urgent && (
                          <span className="ml-2 badge bg-red-100 text-red-700 border border-red-300 text-xs">重点关注</span>
                        )}
                      </p>
                      <p className="text-sm text-red-500/80 mt-0.5">
                        {suggestion.text}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {role === '老人' && activePolicies.some((p) => p.insuranceType === '医疗险') && (() => {
        const medicalExpiring = activePolicies.filter((p) => {
          if (p.insuranceType !== '医疗险') return false
          const days = differenceInDays(parseISO(p.expiryDate), new Date())
          return days >= 0 && days <= 90
        })
        if (medicalExpiring.length === 0) return null
        return (
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '180ms' }}>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-500" />
              医疗险到期提醒
            </h2>
            <div className="space-y-3">
              {medicalExpiring.map((p) => {
                const days = differenceInDays(parseISO(p.expiryDate), new Date())
                return (
                  <div key={p.id} className="card p-4 border-purple-200 bg-purple-50/50">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-purple-500 shrink-0" />
                      <div>
                        <p className="font-medium text-purple-700">
                          {p.company}医疗险将于 {days} 天后到期
                        </p>
                        <p className="text-sm text-purple-500/80 mt-0.5">
                          老人医疗险到期影响大，请务必及时续费
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {overlaps.length > 0 && (
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Copy className="w-5 h-5 text-amber-500" />
            保障重叠
          </h2>
          <div className="space-y-3">
            {overlaps.map((type) => {
              const duplicatePolicies = activePolicies.filter(
                (p) => p.insuranceType === type
              )
              return (
                <div
                  key={type}
                  className="card p-4 border-amber-200 bg-amber-50/50"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-700">
                        {type}存在 {duplicatePolicies.length} 份重复保单
                      </p>
                      <p className="text-sm text-amber-600/80 mt-0.5">
                        重复投保可能无法叠加理赔，建议核实条款
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {duplicatePolicies.map((p) => (
                          <span key={p.id} className="badge bg-amber-100 text-amber-700 border border-amber-200">
                            {p.company} · {formatMoney(p.coverageAmount, '万元')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="mb-8 animate-fade-in" style={{ animationDelay: '240ms' }}>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          有效保单
        </h2>
        {activePolicies.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">暂无有效保单</div>
        ) : (
          <div className="space-y-3">
            {activePolicies.map((p) => (
              <PolicyCard key={p.id} policy={p} status={getPolicyStatus(p)} />
            ))}
          </div>
        )}
      </section>

      {expiredPolicies.length > 0 && (
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="section-title mb-4 flex items-center gap-2 text-gray-400">
            <ShieldOff className="w-5 h-5" />
            已失效保单
          </h2>
          <div className="space-y-3">
            {expiredPolicies.map((p) => (
              <PolicyCard key={p.id} policy={p} status="已失效" muted />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

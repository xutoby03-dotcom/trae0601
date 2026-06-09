import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { differenceInDays, parseISO, isBefore, startOfDay } from 'date-fns'
import type {
  InsurancePolicy,
  RenewalRecord,
  ClaimRecord,
  PolicyStatus,
  InsuranceType,
  PersonRole,
} from '@/types/insurance'

interface InsuranceStore {
  policies: InsurancePolicy[]
  renewals: RenewalRecord[]
  claims: ClaimRecord[]
  personRoles: Record<string, PersonRole>

  addPolicy: (policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => string
  updatePolicy: (id: string, policy: Partial<InsurancePolicy>) => void
  deletePolicy: (id: string) => void

  addRenewal: (renewal: Omit<RenewalRecord, 'id' | 'createdAt'>) => string
  deleteRenewal: (id: string) => void

  addClaim: (claim: Omit<ClaimRecord, 'id' | 'createdAt'>) => string
  updateClaim: (id: string, claim: Partial<ClaimRecord>) => void
  deleteClaim: (id: string) => void

  setPersonRole: (name: string, role: PersonRole) => void
  getPersonRole: (name: string) => PersonRole
  getPolicyStatus: (policy: InsurancePolicy) => PolicyStatus
  getGroupedPolicies: () => Record<PolicyStatus, InsurancePolicy[]>
  getInsuredPersons: () => string[]
  getPersonPolicies: (name: string) => InsurancePolicy[]
  getPersonGaps: (name: string) => InsuranceType[]
  getPersonOverlaps: (name: string) => InsuranceType[]
  getPolicyRenewals: (policyId: string) => RenewalRecord[]
  getPolicyClaims: (policyId: string) => ClaimRecord[]
  getExpiringPolicies: (days?: number) => InsurancePolicy[]
  getTotalAnnualPremium: () => number
  getPersonCoverageAmount: (name: string) => number
}

const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

export const useInsuranceStore = create<InsuranceStore>()(
  persist(
    (set, get) => ({
      policies: [],
      renewals: [],
      claims: [],
      personRoles: {},

      addPolicy: (policyData) => {
        const id = genId()
        const now = new Date().toISOString()
        const policy: InsurancePolicy = {
          ...policyData,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ policies: [...state.policies, policy] }))
        return id
      },

      updatePolicy: (id, updates) => {
        set((state) => ({
          policies: state.policies.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deletePolicy: (id) => {
        set((state) => ({
          policies: state.policies.filter((p) => p.id !== id),
          renewals: state.renewals.filter((r) => r.policyId !== id),
          claims: state.claims.filter((c) => c.policyId !== id),
        }))
      },

      addRenewal: (renewalData) => {
        const id = genId()
        const renewal: RenewalRecord = {
          ...renewalData,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ renewals: [...state.renewals, renewal] }))
        return id
      },

      deleteRenewal: (id) => {
        set((state) => ({ renewals: state.renewals.filter((r) => r.id !== id) }))
      },

      addClaim: (claimData) => {
        const id = genId()
        const claim: ClaimRecord = {
          ...claimData,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ claims: [...state.claims, claim] }))
        return id
      },

      updateClaim: (id, updates) => {
        set((state) => ({
          claims: state.claims.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteClaim: (id) => {
        set((state) => ({ claims: state.claims.filter((c) => c.id !== id) }))
      },

      setPersonRole: (name, role) => {
        set((state) => ({
          personRoles: { ...state.personRoles, [name]: role },
        }))
      },

      getPersonRole: (name): PersonRole => {
        return get().personRoles[name] || '成人'
      },

      getPolicyStatus: (policy: InsurancePolicy): PolicyStatus => {
        const today = startOfDay(new Date())
        const expiry = parseISO(policy.expiryDate)
        const payment = parseISO(policy.paymentDate)

        if (isBefore(expiry, today)) return '已失效'

        const daysToExpiry = differenceInDays(expiry, today)
        const daysToPayment = differenceInDays(payment, today)

        if (daysToPayment >= 0 && daysToPayment <= 30) return '快缴费'
        if (daysToExpiry <= 30) return '快到期'
        return '保障中'
      },

      getGroupedPolicies: () => {
        const { policies, getPolicyStatus } = get()
        const grouped: Record<PolicyStatus, InsurancePolicy[]> = {
          '快缴费': [],
          '快到期': [],
          '保障中': [],
          '已失效': [],
        }
        for (const p of policies) {
          const status = getPolicyStatus(p)
          grouped[status].push(p)
        }
        return grouped
      },

      getInsuredPersons: () => {
        const persons = new Set(get().policies.map((p) => p.insuredPerson))
        return Array.from(persons).sort()
      },

      getPersonPolicies: (name) => {
        return get().policies.filter((p) => p.insuredPerson === name)
      },

      getPersonGaps: (name) => {
        const personPolicies = get().getPersonPolicies(name)
        const coveredTypes = new Set(
          personPolicies
            .filter((p) => get().getPolicyStatus(p) !== '已失效')
            .map((p) => p.insuranceType)
        )
        const role = get().getPersonRole(name)
        const coreTypes: InsuranceType[] = ['重疾险', '医疗险', '意外险']
        return coreTypes.filter((t) => !coveredTypes.has(t))
      },

      getPersonOverlaps: (name) => {
        const personPolicies = get().getPersonPolicies(name)
        const activePolicies = personPolicies.filter(
          (p) => get().getPolicyStatus(p) !== '已失效'
        )
        const typeCount: Record<string, number> = {}
        for (const p of activePolicies) {
          typeCount[p.insuranceType] = (typeCount[p.insuranceType] || 0) + 1
        }
        return (Object.keys(typeCount).filter((t) => typeCount[t] > 1) as InsuranceType[])
      },

      getPolicyRenewals: (policyId) => {
        return get()
          .renewals.filter((r) => r.policyId === policyId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getPolicyClaims: (policyId) => {
        return get()
          .claims.filter((c) => c.policyId === policyId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getExpiringPolicies: (days = 90) => {
        const today = startOfDay(new Date())
        return get().policies.filter((p) => {
          const expiry = parseISO(p.expiryDate)
          const diff = differenceInDays(expiry, today)
          return diff >= 0 && diff <= days
        })
      },

      getTotalAnnualPremium: () => {
        const activePolicies = get().policies.filter(
          (p) => get().getPolicyStatus(p) !== '已失效'
        )
        return activePolicies.reduce((sum, p) => sum + p.premium, 0)
      },

      getPersonCoverageAmount: (name) => {
        return get()
          .getPersonPolicies(name)
          .filter((p) => get().getPolicyStatus(p) !== '已失效')
          .reduce((sum, p) => sum + p.coverageAmount, 0)
      },
    }),
    {
      name: 'family-insurance-storage',
    }
  )
)

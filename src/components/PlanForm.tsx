import { useState } from 'react'
import { usePlanStore } from '@/store/planStore'
import type { Plan } from '@/types'
import { EMPTY_PLAN } from '@/types'
import { Plus, X, Edit3, Trash2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PlanForm() {
  const { plans, addPlan, updatePlan, removePlan } = usePlanStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Plan, 'id'>>(EMPTY_PLAN)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = () => {
    if (!form.name.trim()) return
    const newPlan: Plan = { ...form, id: crypto.randomUUID() }
    addPlan(newPlan)
    setForm(EMPTY_PLAN)
    setShowForm(false)
  }

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      monthlyFee: plan.monthlyFee,
      discountedFee: plan.discountedFee,
      speed: plan.speed,
      contractMonths: plan.contractMonths,
      installFee: plan.installFee,
      routerFee: plan.routerFee,
      freeData: plan.freeData,
      tvPackage: plan.tvPackage,
      earlyTerminationFee: plan.earlyTerminationFee,
      discountEndDate: plan.discountEndDate,
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!editingId || !form.name.trim()) return
    updatePlan(editingId, form)
    setEditingId(null)
    setForm(EMPTY_PLAN)
    setShowForm(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm(EMPTY_PLAN)
    setShowForm(false)
  }

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">已录入套餐</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-[#e55a2b] hover:shadow-lg hover:shadow-orange-300 active:scale-95"
          >
            <Plus size={18} />
            添加套餐
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-lg shadow-orange-50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? '编辑套餐' : '添加新套餐'}
            </h3>
            <button
              onClick={handleCancel}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormField label="运营商/套餐名" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="如：电信融合套餐"
                className="input-field"
              />
            </FormField>

            <FormField label="月租（元/月）" required>
              <input
                type="number"
                value={form.monthlyFee || ''}
                onChange={(e) => updateField('monthlyFee', +e.target.value)}
                placeholder="如：169"
                className="input-field"
              />
            </FormField>

            <FormField label="优惠月租（元/月）">
              <input
                type="number"
                value={form.discountedFee || ''}
                onChange={(e) => updateField('discountedFee', +e.target.value)}
                placeholder="首年优惠价，如：99"
                className="input-field"
              />
            </FormField>

            <FormField label="宽带速率（Mbps）" required>
              <input
                type="number"
                value={form.speed || ''}
                onChange={(e) => updateField('speed', +e.target.value)}
                placeholder="如：500"
                className="input-field"
              />
            </FormField>

            <FormField label="合约期（月）">
              <input
                type="number"
                value={form.contractMonths || ''}
                onChange={(e) => updateField('contractMonths', +e.target.value)}
                placeholder="如：24"
                className="input-field"
              />
            </FormField>

            <FormField label="安装费（元）">
              <input
                type="number"
                value={form.installFee || ''}
                onChange={(e) => updateField('installFee', +e.target.value)}
                placeholder="如：200"
                className="input-field"
              />
            </FormField>

            <FormField label="路由器费用（元）">
              <input
                type="number"
                value={form.routerFee || ''}
                onChange={(e) => updateField('routerFee', +e.target.value)}
                placeholder="如：0 或 200"
                className="input-field"
              />
            </FormField>

            <FormField label="赠送流量/话费">
              <input
                type="text"
                value={form.freeData}
                onChange={(e) => updateField('freeData', e.target.value)}
                placeholder="如：20GB/月 或 无"
                className="input-field"
              />
            </FormField>

            <FormField label="电视包">
              <input
                type="text"
                value={form.tvPackage}
                onChange={(e) => updateField('tvPackage', e.target.value)}
                placeholder="如：IPTV基础包 或 无"
                className="input-field"
              />
            </FormField>

            <FormField label="提前解约费（元）">
              <input
                type="number"
                value={form.earlyTerminationFee || ''}
                onChange={(e) => updateField('earlyTerminationFee', +e.target.value)}
                placeholder="如：300"
                className="input-field"
              />
            </FormField>

            <FormField label="优惠结束日期">
              <input
                type="date"
                value={form.discountEndDate}
                onChange={(e) => updateField('discountEndDate', e.target.value)}
                className="input-field"
              />
            </FormField>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={editingId ? handleSave : handleAdd}
              className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#e55a2b] active:scale-95"
            >
              <Save size={16} />
              {editingId ? '保存修改' : '添加套餐'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {plans.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
          <div className="mb-3 text-5xl">📡</div>
          <p className="text-base font-medium text-slate-500">
            还没有录入套餐
          </p>
          <p className="mt-1 text-sm text-slate-400">
            点击上方按钮添加运营商套餐开始对比
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group relative rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
            >
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(plan)}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#ff6b35]"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => removePlan(plan.id)}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h4 className="mb-3 text-base font-bold text-slate-800">
                {plan.name}
              </h4>

              <div className="space-y-2 text-sm">
                <PlanRow label="月租" value={`${plan.monthlyFee}元/月`} highlight />
                {plan.discountedFee > 0 && plan.discountedFee < plan.monthlyFee && (
                  <PlanRow label="优惠月租" value={`${plan.discountedFee}元/月`} highlight accent />
                )}
                <PlanRow label="速率" value={`${plan.speed}Mbps`} />
                <PlanRow label="合约期" value={`${plan.contractMonths}个月`} />
                {plan.installFee > 0 && (
                  <PlanRow label="安装费" value={`${plan.installFee}元`} />
                )}
                {plan.routerFee > 0 && (
                  <PlanRow label="路由器" value={`${plan.routerFee}元`} />
                )}
                {plan.freeData && (
                  <PlanRow label="赠送" value={plan.freeData} />
                )}
                {plan.tvPackage && (
                  <PlanRow label="电视包" value={plan.tvPackage} />
                )}
                {plan.earlyTerminationFee > 0 && (
                  <PlanRow label="解约费" value={`${plan.earlyTerminationFee}元`} />
                )}
                {plan.discountEndDate && (
                  <PlanRow label="优惠截止" value={plan.discountEndDate} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function PlanRow({
  label,
  value,
  highlight,
  accent,
}: {
  label: string
  value: string
  highlight?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span
        className={cn(
          'font-medium',
          highlight && !accent && 'text-slate-800',
          accent && 'font-bold text-[#ff6b35]',
          !highlight && !accent && 'text-slate-600'
        )}
      >
        {value}
      </span>
    </div>
  )
}

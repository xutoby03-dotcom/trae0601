import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { DEPARTMENTS, DEMO_SCENARIOS } from "@/data/mockData"
import { ArrowLeft, Save } from "lucide-react"
import type { BorrowRecord } from "@/types"

export default function BorrowForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedDeviceId = searchParams.get("deviceId")

  const devices = useStore((s) => s.devices)
  const addBorrowRecord = useStore((s) => s.addBorrowRecord)

  const idleDevices = devices.filter((d) => d.status === "idle")

  const [form, setForm] = useState({
    deviceId: preselectedDeviceId ?? "",
    customer: "",
    project: "",
    borrower: "",
    borrowerDepartment: "",
    expectedReturnDate: "",
    demoScenario: "",
    hasSensitiveData: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.deviceId) errs.deviceId = "请选择样机"
    if (!form.customer.trim()) errs.customer = "请输入客户名称"
    if (!form.borrower.trim()) errs.borrower = "请输入借用人"
    if (!form.borrowerDepartment) errs.borrowerDepartment = "请选择借用人部门"
    if (!form.expectedReturnDate) errs.expectedReturnDate = "请选择预计归还日期"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const device = devices.find((d) => d.id === form.deviceId)
    if (!device) return

    const record: BorrowRecord = {
      id: `br-${Date.now()}`,
      deviceId: form.deviceId,
      customer: form.customer,
      project: form.project,
      borrower: form.borrower,
      borrowerDepartment: form.borrowerDepartment,
      borrowDate: new Date().toISOString(),
      expectedReturnDate: new Date(form.expectedReturnDate).toISOString(),
      actualReturnDate: null,
      demoScenario: form.demoScenario,
      hasSensitiveData: form.hasSensitiveData,
      status: "borrowed",
    }

    addBorrowRecord(record)
    navigate("/records")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">外借登记</h2>
          <p className="text-sm text-slate-500 mt-0.5">填写外借信息并选择可用样机</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">选择样机</h3>
          <FormField label="样机设备" error={errors.deviceId} required>
            <select
              value={form.deviceId}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              className="select-field"
            >
              <option value="">请选择空闲样机</option>
              {idleDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.model} ({d.department})
                </option>
              ))}
            </select>
          </FormField>
          {form.deviceId && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm">
              {(() => {
                const d = devices.find((d) => d.id === form.deviceId)
                if (!d) return null
                return (
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <span>型号：{d.model}</span>
                    <span>序列号：{d.serialNumber}</span>
                    <span>固件：{d.firmwareVersion}</span>
                    <span>配件：{d.accessories.join("、")}</span>
                  </div>
                )
              })()}
            </div>
          )}
          {idleDevices.length === 0 && (
            <p className="text-sm text-red-500 mt-2">当前没有空闲样机可借出</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">借用信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="客户名称" error={errors.customer} required>
              <input
                type="text"
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                className="input-field"
                placeholder="客户公司名称"
              />
            </FormField>
            <FormField label="客户项目">
              <input
                type="text"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="input-field"
                placeholder="关联项目名称"
              />
            </FormField>
            <FormField label="借用人" error={errors.borrower} required>
              <input
                type="text"
                value={form.borrower}
                onChange={(e) => setForm({ ...form, borrower: e.target.value })}
                className="input-field"
                placeholder="借用人姓名"
              />
            </FormField>
            <FormField label="借用人部门" error={errors.borrowerDepartment} required>
              <select
                value={form.borrowerDepartment}
                onChange={(e) => setForm({ ...form, borrowerDepartment: e.target.value })}
                className="select-field"
              >
                <option value="">请选择部门</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>
            <FormField label="预计归还日期" error={errors.expectedReturnDate} required>
              <input
                type="date"
                value={form.expectedReturnDate}
                onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
                className="input-field"
              />
            </FormField>
            <FormField label="演示场景">
              <select
                value={form.demoScenario}
                onChange={(e) => setForm({ ...form, demoScenario: e.target.value })}
                className="select-field"
              >
                <option value="">请选择场景</option>
                {DEMO_SCENARIOS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasSensitiveData}
                onChange={(e) => setForm({ ...form, hasSensitiveData: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">该样机包含客户敏感数据</span>
            </label>
            {form.hasSensitiveData && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠ 归还时需确认敏感数据已清空
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/devices" className="btn-secondary">取消</Link>
          <button type="submit" className="btn-primary" disabled={idleDevices.length === 0}>
            <Save size={16} />
            确认借出
          </button>
        </div>
      </form>
    </div>
  )
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label-field">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

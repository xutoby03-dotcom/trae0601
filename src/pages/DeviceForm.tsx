import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { DEPARTMENTS, ACCESSORIES_OPTIONS } from "@/data/mockData"
import { ArrowLeft, Save } from "lucide-react"
import type { Device } from "@/types"

export default function DeviceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const devices = useStore((s) => s.devices)
  const addDevice = useStore((s) => s.addDevice)
  const updateDevice = useStore((s) => s.updateDevice)

  const isEdit = !!id
  const existing = isEdit ? devices.find((d) => d.id === id) : null

  const [form, setForm] = useState({
    code: existing?.code ?? "",
    model: existing?.model ?? "",
    serialNumber: existing?.serialNumber ?? "",
    firmwareVersion: existing?.firmwareVersion ?? "",
    standardFirmware: existing?.standardFirmware ?? "",
    accessories: existing?.accessories ?? [] as string[],
    accountStatus: existing?.accountStatus ?? ("none" as Device["accountStatus"]),
    department: existing?.department ?? "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleAccessory(acc: string) {
    setForm((f) => ({
      ...f,
      accessories: f.accessories.includes(acc)
        ? f.accessories.filter((a) => a !== acc)
        : [...f.accessories, acc],
    }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.code.trim()) errs.code = "请输入设备编号"
    if (!form.model.trim()) errs.model = "请输入设备型号"
    if (!form.serialNumber.trim()) errs.serialNumber = "请输入序列号"
    if (!form.firmwareVersion.trim()) errs.firmwareVersion = "请输入固件版本"
    if (!form.standardFirmware.trim()) errs.standardFirmware = "请输入标准固件版本"
    if (!form.department) errs.department = "请选择归属部门"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (isEdit && existing) {
      updateDevice(existing.id, { ...form })
    } else {
      const newDevice: Device = {
        id: `dev-${Date.now()}`,
        ...form,
        photos: [],
        status: "idle",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addDevice(newDevice)
    }
    navigate("/devices")
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
        <h2 className="font-display text-2xl font-bold text-slate-900">
          {isEdit ? "编辑样机" : "新增样机"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="设备编号" error={errors.code} required>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="input-field"
                placeholder="YM-2024-XXX"
              />
            </FormField>
            <FormField label="设备型号" error={errors.model} required>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="input-field"
                placeholder="Trae Pro X1"
              />
            </FormField>
            <FormField label="序列号" error={errors.serialNumber} required>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="input-field"
                placeholder="SN-XXXX-XXXXXX"
              />
            </FormField>
            <FormField label="归属部门" error={errors.department} required>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="select-field"
              >
                <option value="">请选择部门</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">固件与账号</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="当前固件版本" error={errors.firmwareVersion} required>
              <input
                type="text"
                value={form.firmwareVersion}
                onChange={(e) => setForm({ ...form, firmwareVersion: e.target.value })}
                className="input-field"
                placeholder="v3.2.1"
              />
            </FormField>
            <FormField label="标准固件版本" error={errors.standardFirmware} required>
              <input
                type="text"
                value={form.standardFirmware}
                onChange={(e) => setForm({ ...form, standardFirmware: e.target.value })}
                className="input-field"
                placeholder="v3.2.1"
              />
            </FormField>
            <FormField label="账号状态" error={errors.accountStatus}>
              <select
                value={form.accountStatus}
                onChange={(e) => setForm({ ...form, accountStatus: e.target.value as Device["accountStatus"] })}
                className="select-field"
              >
                <option value="none">无账号</option>
                <option value="active">有效</option>
                <option value="expired">已过期</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">配件清单</h3>
          <div className="flex flex-wrap gap-2">
            {ACCESSORIES_OPTIONS.map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => toggleAccessory(acc)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.accessories.includes(acc)
                    ? "bg-brand-50 border-brand-300 text-brand-700"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {form.accessories.includes(acc) ? "✓ " : ""}
                {acc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/devices" className="btn-secondary">取消</Link>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            {isEdit ? "保存修改" : "创建样机"}
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

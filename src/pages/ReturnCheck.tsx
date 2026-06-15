import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { ArrowLeft, CheckCircle2, XCircle, Save } from "lucide-react"
import type { ReturnCheck } from "@/types"

export default function ReturnCheckPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const borrowRecords = useStore((s) => s.borrowRecords)
  const devices = useStore((s) => s.devices)
  const returnDevice = useStore((s) => s.returnDevice)

  const record = borrowRecords.find((r) => r.id === id)
  const device = record ? devices.find((d) => d.id === record.deviceId) : null

  const [check, setCheck] = useState<ReturnCheck>({
    accessoriesComplete: true,
    accessoriesNote: "",
    noNewScratches: true,
    scratchesNote: "",
    batteryLevel: 100,
    dataCleared: true,
    dataClearNote: "",
    firmwareRolledBack: true,
    firmwareNote: "",
    checkedAt: "",
    checkedBy: "",
    passed: true,
  })

  if (!record || !device) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <p className="text-slate-400">未找到该外借记录</p>
        <Link to="/records" className="btn-secondary mt-4 inline-flex">
          返回记录列表
        </Link>
      </div>
    )
  }

  function updateCheck(partial: Partial<ReturnCheck>) {
    setCheck((prev) => {
      const next = { ...prev, ...partial }
      next.passed =
        next.accessoriesComplete &&
        next.noNewScratches &&
        next.dataCleared &&
        next.firmwareRolledBack
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalCheck: ReturnCheck = {
      ...check,
      checkedAt: new Date().toISOString(),
      checkedBy: "当前用户",
    }
    returnDevice(record.id, finalCheck)
    navigate("/records")
  }

  const checkItems = [
    {
      key: "accessoriesComplete" as const,
      noteKey: "accessoriesNote" as const,
      label: "配件齐全",
      desc: `检查配件：${device.accessories.join("、")}`,
    },
    {
      key: "noNewScratches" as const,
      noteKey: "scratchesNote" as const,
      label: "无新增划痕",
      desc: "检查设备外观是否有新增划痕或损伤",
    },
    {
      key: "dataCleared" as const,
      noteKey: "dataClearNote" as const,
      label: "客户数据已清空",
      desc: record.hasSensitiveData
        ? "⚠ 该外借含敏感数据，务必确认已清空"
        : "确认设备上的客户数据已清除",
    },
    {
      key: "firmwareRolledBack" as const,
      noteKey: "firmwareNote" as const,
      label: "固件已回滚至标准版",
      desc: `标准版本：${device.standardFirmware}，当前版本：${device.firmwareVersion}`,
    },
  ]

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
          <h2 className="font-display text-2xl font-bold text-slate-900">归还检查</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            逐项确认设备状态后再完成归还
          </p>
        </div>
      </div>

      <div className="card p-4 mb-5 bg-slate-50">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">设备编号：</span>
            <span className="font-mono font-medium text-slate-800">{device.code}</span>
          </div>
          <div>
            <span className="text-slate-500">设备型号：</span>
            <span className="font-medium text-slate-800">{device.model}</span>
          </div>
          <div>
            <span className="text-slate-500">借用人：</span>
            <span className="font-medium text-slate-800">{record.borrower}</span>
          </div>
          <div>
            <span className="text-slate-500">客户：</span>
            <span className="font-medium text-slate-800">{record.customer}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {checkItems.map((item) => (
          <div
            key={item.key}
            className={`card p-5 transition-colors ${
              !check[item.key] ? "border-red-200 bg-red-50/30" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => updateCheck({ [item.key]: !check[item.key] })}
                className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                  check[item.key]
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {check[item.key] && <CheckCircle2 size={16} />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  {!check[item.key] && (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                {!check[item.key] && (
                  <textarea
                    value={check[item.noteKey]}
                    onChange={(e) => updateCheck({ [item.noteKey]: e.target.value })}
                    className="input-field mt-2 min-h-[60px] resize-y"
                    placeholder="请描述异常情况..."
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="label-field shrink-0">电量百分比</span>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={check.batteryLevel}
                onChange={(e) => updateCheck({ batteryLevel: Number(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <span className="text-sm font-mono font-medium text-slate-700 w-12 text-right">
                {check.batteryLevel}%
              </span>
            </div>
          </div>
        </div>

        <div className={`card p-4 ${!check.passed ? "border-red-300 bg-red-50/50" : "border-emerald-300 bg-emerald-50/50"}`}>
          <div className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : (
              <XCircle size={20} className="text-red-500" />
            )}
            <span className={`font-medium ${check.passed ? "text-emerald-700" : "text-red-700"}`}>
              {check.passed ? "所有检查项已通过，可以归还" : "存在未通过项，归还后将标记异常"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/records" className="btn-secondary">取消</Link>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            确认归还
          </button>
        </div>
      </form>
    </div>
  )
}

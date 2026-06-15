import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { DEPARTMENTS } from "@/data/mockData"
import { SeverityBadge } from "@/components/StatusBadge"
import { format } from "date-fns"
import {
  Search,
  Filter,
  X,
  Eye,
  ClipboardCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Clock,
  Package,
  Zap,
  Database,
  ChevronRight,
  ExternalLink,
  Usb,
  Download,
} from "lucide-react"
import type { BorrowRecord, AlertItem } from "@/types"

const statusLabels: Record<BorrowRecord["status"], string> = {
  borrowed: "借出中",
  returned: "已归还",
  overdue: "逾期",
}
const statusClass: Record<BorrowRecord["status"], string> = {
  borrowed: "bg-brand-50 text-brand-700 border-brand-200",
  returned: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
}

export default function BorrowRecords() {
  const borrowRecords = useStore((s) => s.borrowRecords)
  const devices = useStore((s) => s.devices)
  const alerts = useStore((s) => s.alerts)
  const resolveAlert = useStore((s) => s.resolveAlert)

  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [customerFilter, setCustomerFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<BorrowRecord["status"] | "">("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null)

  const allCustomers = Array.from(new Set(borrowRecords.map((r) => r.customer).filter(Boolean))).sort()
  const allProjects = Array.from(new Set(borrowRecords.map((r) => r.project).filter(Boolean))).sort()

  const filtered = borrowRecords
    .filter((r) => {
      if (search) {
        const device = devices.find((d) => d.id === r.deviceId)
        const haystack = `${device?.code ?? ""} ${r.borrower} ${r.customer} ${r.project}`.toLowerCase()
        if (!haystack.includes(search.toLowerCase())) return false
      }
      if (deptFilter && r.borrowerDepartment !== deptFilter) return false
      if (customerFilter && r.customer !== customerFilter) return false
      if (projectFilter && r.project !== projectFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())

  const hasActiveFilters = deptFilter || statusFilter || customerFilter || projectFilter

  const device = selectedRecord ? devices.find((d) => d.id === selectedRecord.deviceId) : null
  const recordAlerts = selectedRecord
    ? alerts.filter(
        (a) => a.borrowRecordId === selectedRecord.id || a.deviceId === selectedRecord.deviceId
      )
    : []

  function handleExport() {
    if (!selectedRecord || !device) return
    const r = selectedRecord
    const rc = r.returnCheck
    const severityLabel: Record<AlertItem["severity"], string> = {
      high: "高",
      medium: "中",
      low: "低",
    }
    const typeLabel: Record<AlertItem["type"], string> = {
      overdue: "逾期未还",
      sensitive_data: "敏感数据",
      non_standard_firmware: "非标准固件/异常",
    }
    const sortedAlerts = [...recordAlerts].sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title>外借单据 - ${r.id}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #1e293b; }
  .wrap { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 14px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; margin-bottom: 12px; color: #334155; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
  .field { display: flex; }
  .field .label { color: #64748b; width: 100px; font-size: 13px; flex-shrink: 0; }
  .field .value { font-size: 13px; color: #1e293b; word-break: break-all; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; border: 1px solid; }
  .tag-green { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
  .tag-red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
  .tag-amber { background: #fffbeb; color: #92400e; border-color: #fde68a; }
  .tag-slate { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
  .check-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
  .check-item.fail { background: #fef2f2; border-color: #fecaca; }
  .check-item .icon { width: 18px; flex-shrink: 0; }
  .check-item .text { flex: 1; font-size: 13px; }
  .check-item .note { font-size: 12px; color: #b91c1c; margin-top: 2px; }
  .alert-item { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
  .alert-item.resolved { opacity: 0.6; }
  .alert-head { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 4px; flex-wrap: wrap; }
  .alert-msg { font-size: 13px; color: #1e293b; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>外借单据</h1>
    <p class="subtitle">单据编号 ${r.id} · 导出时间 ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}</p>

    <div class="section">
      <div class="section-title">设备信息</div>
      <div class="grid">
        <div class="field"><span class="label">设备编号</span><span class="value">${device.code}</span></div>
        <div class="field"><span class="label">设备型号</span><span class="value">${device.model}</span></div>
        <div class="field"><span class="label">序列号</span><span class="value">${device.serialNumber}</span></div>
        <div class="field"><span class="label">固件版本</span><span class="value">${device.firmwareVersion}${device.firmwareVersion !== device.standardFirmware ? `（标准：${device.standardFirmware}）` : ""}</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">客户与项目</div>
      <div class="grid">
        <div class="field"><span class="label">客户名称</span><span class="value">${r.customer}</span></div>
        <div class="field"><span class="label">项目名称</span><span class="value">${r.project || "-"}</span></div>
        <div class="field"><span class="label">演示场景</span><span class="value">${r.demoScenario || "-"}</span></div>
        <div class="field"><span class="label">含敏感数据</span><span class="value">${r.hasSensitiveData ? '<span class="tag tag-red">是</span>' : '<span class="tag tag-slate">否</span>'}</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">借用信息</div>
      <div class="grid">
        <div class="field"><span class="label">借用人</span><span class="value">${r.borrower}</span></div>
        <div class="field"><span class="label">借用人部门</span><span class="value">${r.borrowerDepartment}</span></div>
        <div class="field"><span class="label">借出日期</span><span class="value">${format(new Date(r.borrowDate), "yyyy-MM-dd HH:mm")}</span></div>
        <div class="field"><span class="label">预计归还</span><span class="value">${format(new Date(r.expectedReturnDate), "yyyy-MM-dd HH:mm")}</span></div>
        <div class="field"><span class="label">实际归还</span><span class="value">${r.actualReturnDate ? format(new Date(r.actualReturnDate), "yyyy-MM-dd HH:mm") : "未归还"}</span></div>
        <div class="field"><span class="label">单据状态</span><span class="value">${r.status === "borrowed" ? '<span class="tag tag-amber">借出中</span>' : r.status === "returned" ? '<span class="tag tag-green">已归还</span>' : '<span class="tag tag-red">逾期</span>'}</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">归还检查${rc ? (rc.passed ? ' · <span class="tag tag-green" style="vertical-align:middle">全部通过</span>' : ' · <span class="tag tag-red" style="vertical-align:middle">存在未通过项</span>') : ' · <span class="tag tag-slate" style="vertical-align:middle">未检查</span>'}</div>
      ${rc ? `
        <div class="check-item ${rc.accessoriesComplete ? "" : "fail"}">
          <div class="icon">${rc.accessoriesComplete ? "✅" : "❌"}</div>
          <div>
            <div class="text">配件齐全</div>
            ${rc.accessoriesNote ? `<div class="note">${rc.accessoriesNote}</div>` : ""}
          </div>
        </div>
        <div class="check-item ${rc.noNewScratches ? "" : "fail"}">
          <div class="icon">${rc.noNewScratches ? "✅" : "❌"}</div>
          <div>
            <div class="text">无新增划痕</div>
            ${rc.scratchesNote ? `<div class="note">${rc.scratchesNote}</div>` : ""}
          </div>
        </div>
        <div class="check-item ${rc.batteryLevel >= 20 ? "" : "fail"}">
          <div class="icon">${rc.batteryLevel >= 20 ? "✅" : "⚠️"}</div>
          <div>
            <div class="text">剩余电量：${rc.batteryLevel}%</div>
            ${rc.batteryLevel < 20 ? `<div class="note">电量偏低</div>` : ""}
          </div>
        </div>
        <div class="check-item ${rc.dataCleared ? "" : "fail"}">
          <div class="icon">${rc.dataCleared ? "✅" : "❌"}</div>
          <div>
            <div class="text">客户数据已清空</div>
            ${rc.dataClearNote ? `<div class="note">${rc.dataClearNote}</div>` : ""}
          </div>
        </div>
        <div class="check-item ${rc.firmwareRolledBack ? "" : "fail"}">
          <div class="icon">${rc.firmwareRolledBack ? "✅" : "❌"}</div>
          <div>
            <div class="text">固件已回滚至标准版</div>
            ${rc.firmwareNote ? `<div class="note">${rc.firmwareNote}</div>` : ""}
          </div>
        </div>
        <div class="field" style="margin-top:12px"><span class="label">检查时间</span><span class="value">${format(new Date(rc.checkedAt), "yyyy-MM-dd HH:mm")}</span></div>
        <div class="field"><span class="label">检查人</span><span class="value">${rc.checkedBy}</span></div>
      ` : `<div style="padding:20px; text-align:center; color:#94a3b8; font-size:13px;">该单据尚未进行归还检查</div>`}
    </div>

    <div class="section">
      <div class="section-title">相关预警 · ${sortedAlerts.filter(a => !a.resolved).length} 条未处理</div>
      ${sortedAlerts.length > 0 ? sortedAlerts.map(a => `
        <div class="alert-item ${a.resolved ? "resolved" : ""}">
          <div class="alert-head">
            <span>${format(new Date(a.createdAt), "yyyy-MM-dd HH:mm")}</span>
            <span class="tag tag-slate">${typeLabel[a.type]}</span>
            <span class="tag ${a.severity === "high" ? "tag-red" : a.severity === "medium" ? "tag-amber" : "tag-slate"}">严重程度：${severityLabel[a.severity]}</span>
            ${a.resolved ? '<span class="tag tag-green">已处理</span>' : ""}
          </div>
          <div class="alert-msg">${a.message}</div>
        </div>
      `).join("") : `<div style="padding:20px; text-align:center; color:#94a3b8; font-size:13px;">暂无相关预警</div>`}
    </div>

    <div class="footer">样机外借追踪系统 · 本单据由系统自动导出</div>
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `外借单-${r.id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">外借记录</h2>
          <p className="text-sm text-slate-500 mt-1">查看所有样机的外借与归还记录</p>
        </div>
        <Link to="/borrow" className="btn-primary">
          新增外借
        </Link>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索编号、借用人、客户..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? "ring-2 ring-brand-500/30" : ""}`}
          >
            <Filter size={16} />
            筛选
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={() => { setDeptFilter(""); setStatusFilter(""); setCustomerFilter(""); setProjectFilter("") }}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <X size={14} />
              清除筛选
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">客户</label>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="select-field w-52"
              >
                <option value="">全部客户</option>
                {allCustomers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">项目</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="select-field w-52"
              >
                <option value="">全部项目</option>
                {allProjects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">部门</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="select-field w-40"
              >
                <option value="">全部部门</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">状态</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BorrowRecord["status"] | "")}
                className="select-field w-32"
              >
                <option value="">全部状态</option>
                <option value="borrowed">借出中</option>
                <option value="returned">已归还</option>
                <option value="overdue">逾期</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">设备编号</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">借用人</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">客户</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">项目</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">借出日期</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">预计归还</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">状态</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => {
              const d = devices.find((d) => d.id === record.deviceId)
              return (
                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/devices/${record.deviceId}`} className="font-mono text-sm font-medium text-brand-600 hover:text-brand-700">
                      {d?.code ?? "-"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{record.borrower}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {record.customer}
                    {record.hasSensitiveData && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded border border-red-200">敏感</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.project || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{format(new Date(record.borrowDate), "yyyy-MM-dd")}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{format(new Date(record.expectedReturnDate), "yyyy-MM-dd")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusClass[record.status]}`}>
                      {statusLabels[record.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        title="查看详情"
                      >
                        <FileText size={16} />
                      </button>
                      <Link
                        to={`/devices/${record.deviceId}`}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        title="查看设备"
                      >
                        <Eye size={16} />
                      </Link>
                      {(record.status === "borrowed" || record.status === "overdue") && (
                        <Link
                          to={`/borrow/return/${record.id}`}
                          className="p-1.5 rounded-md hover:bg-brand-50 text-slate-500 hover:text-brand-600 transition-colors"
                          title="归还检查"
                        >
                          <ClipboardCheck size={16} />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  没有找到匹配的记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {borrowRecords.length} 条记录，当前显示 {filtered.length} 条
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSelectedRecord(null)}
          />
          <div className="relative w-[520px] max-w-full bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">外借单据详情</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {device?.code} · {device?.model}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <Section title="基本信息" icon={FileText}>
                <InfoGrid>
                  <InfoRow label="设备编号">
                    <Link
                      to={`/devices/${selectedRecord.deviceId}`}
                      className="font-mono text-sm font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      {device?.code} <ExternalLink size={12} />
                    </Link>
                  </InfoRow>
                  <InfoRow label="设备型号">{device?.model}</InfoRow>
                  <InfoRow label="借用人">{selectedRecord.borrower}</InfoRow>
                  <InfoRow label="借用人部门">{selectedRecord.borrowerDepartment}</InfoRow>
                </InfoGrid>
              </Section>

              <Section title="客户与项目" icon={ChevronRight}>
                <InfoGrid>
                  <InfoRow label="客户">{selectedRecord.customer}</InfoRow>
                  <InfoRow label="项目">{selectedRecord.project || "-"}</InfoRow>
                  <InfoRow label="演示场景">{selectedRecord.demoScenario || "-"}</InfoRow>
                  <InfoRow label="含敏感数据">
                    {selectedRecord.hasSensitiveData ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                        <ShieldAlert size={12} />
                        是
                      </span>
                    ) : (
                      <span className="text-sm text-slate-600">否</span>
                    )}
                  </InfoRow>
                </InfoGrid>
              </Section>

              <Section title="时间线" icon={Clock}>
                <InfoGrid>
                  <InfoRow label="借出日期">
                    {format(new Date(selectedRecord.borrowDate), "yyyy-MM-dd HH:mm")}
                  </InfoRow>
                  <InfoRow label="预计归还">
                    {format(new Date(selectedRecord.expectedReturnDate), "yyyy-MM-dd HH:mm")}
                  </InfoRow>
                  <InfoRow label="实际归还">
                    {selectedRecord.actualReturnDate
                      ? format(new Date(selectedRecord.actualReturnDate), "yyyy-MM-dd HH:mm")
                      : <span className="text-slate-400">未归还</span>}
                  </InfoRow>
                  <InfoRow label="当前状态">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusClass[selectedRecord.status]}`}>
                      {statusLabels[selectedRecord.status]}
                    </span>
                  </InfoRow>
                </InfoGrid>
              </Section>

              <Section
                title="归还检查"
                icon={ClipboardCheck}
                badge={
                  selectedRecord.returnCheck
                    ? selectedRecord.returnCheck.passed
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200"><CheckCircle2 size={12} /> 已通过</span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200"><XCircle size={12} /> 未通过</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded-full border border-slate-200">未检查</span>
                }
              >
                {selectedRecord.returnCheck ? (
                  <div className="space-y-3">
                    <CheckItem
                      icon={Package}
                      label="配件齐全"
                      passed={selectedRecord.returnCheck.accessoriesComplete}
                      note={selectedRecord.returnCheck.accessoriesNote}
                    />
                    <CheckItem
                      icon={AlertTriangle}
                      label="无新增划痕"
                      passed={selectedRecord.returnCheck.noNewScratches}
                      note={selectedRecord.returnCheck.scratchesNote}
                    />
                    <CheckItem
                      icon={Zap}
                      label={`电量：${selectedRecord.returnCheck.batteryLevel}%`}
                      passed={selectedRecord.returnCheck.batteryLevel >= 20}
                      note={selectedRecord.returnCheck.batteryLevel < 20 ? "电量偏低" : ""}
                    />
                    <CheckItem
                      icon={Database}
                      label="客户数据已清空"
                      passed={selectedRecord.returnCheck.dataCleared}
                      note={selectedRecord.returnCheck.dataClearNote}
                    />
                    <CheckItem
                      icon={Usb}
                      label="固件已回滚标准版"
                      passed={selectedRecord.returnCheck.firmwareRolledBack}
                      note={selectedRecord.returnCheck.firmwareNote}
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <Clock size={12} />
                      <span>检查时间：{format(new Date(selectedRecord.returnCheck.checkedAt), "yyyy-MM-dd HH:mm")}</span>
                      <span className="mx-1">·</span>
                      <span>检查人：{selectedRecord.returnCheck.checkedBy}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 text-center py-4">
                    该单据尚未进行归还检查
                    {selectedRecord.status !== "returned" && (
                      <div className="mt-3">
                        <Link
                          to={`/borrow/return/${selectedRecord.id}`}
                          className="btn-primary text-xs inline-flex"
                          onClick={() => setSelectedRecord(null)}
                        >
                          <ClipboardCheck size={12} />
                          去做归还检查
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              <Section
                title="相关预警"
                icon={AlertTriangle}
                badge={
                  recordAlerts.filter((a) => !a.resolved).length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                      {recordAlerts.filter((a) => !a.resolved).length} 条未处理
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200">
                      无异常
                    </span>
                  )
                }
              >
                {recordAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {recordAlerts
                      .sort((a, b) => {
                        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      })
                      .map((alert) => (
                        <AlertRow
                          key={alert.id}
                          alert={alert}
                          onResolve={() => resolveAlert(alert.id)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 text-center py-4">
                    暂无相关预警
                  </div>
                )}
              </Section>

              <div className="pt-4 border-t border-slate-100">
                <button onClick={handleExport} className="btn-primary w-full justify-center">
                  <Download size={16} />
                  导出单据为 HTML 文件
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  badge,
  children,
}: {
  title: string
  icon: React.ComponentType<any>
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-brand-50 text-brand-600 rounded-md">
          <Icon size={14} />
        </div>
        <h4 className="font-display font-semibold text-slate-800 text-sm">{title}</h4>
        {badge}
      </div>
      <div className="pl-7">{children}</div>
    </div>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  )
}

function CheckItem({
  icon: Icon,
  label,
  passed,
  note,
}: {
  icon: React.ComponentType<any>
  label: string
  passed: boolean
  note?: string
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        passed ? "border-slate-200 bg-slate-50/50" : "border-red-200 bg-red-50/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className={passed ? "text-slate-400" : "text-red-500"} />
        <span className="text-sm text-slate-700 flex-1">{label}</span>
        {passed ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : (
          <XCircle size={16} className="text-red-500" />
        )}
      </div>
      {note && (
        <p className="mt-1 text-xs text-red-600 ml-6">{note}</p>
      )}
    </div>
  )
}

function AlertRow({
  alert,
  onResolve,
}: {
  alert: AlertItem
  onResolve: () => void
}) {
  const iconMap = {
    overdue: Clock,
    sensitive_data: ShieldAlert,
    non_standard_firmware: Cpu,
  }
  const colorMap = {
    overdue: "text-red-500 bg-red-50",
    sensitive_data: "text-brand-600 bg-brand-50",
    non_standard_firmware: "text-slate-600 bg-slate-100",
  }
  const Icon = iconMap[alert.type]
  const colors = colorMap[alert.type]

  return (
    <div
      className={`p-3 rounded-lg border border-slate-200 ${
        alert.resolved ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-md ${colors}`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">
              {format(new Date(alert.createdAt), "yyyy-MM-dd HH:mm")}
            </span>
            <SeverityBadge severity={alert.severity} />
            {alert.resolved && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full border border-emerald-200">
                <CheckCircle2 size={10} />
                已处理
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
          {!alert.resolved && (
            <button
              onClick={onResolve}
              className="mt-2 text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              标记已处理
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { DEPARTMENTS } from "@/data/mockData"
import { format } from "date-fns"
import { Search, Filter, X, Eye, ClipboardCheck } from "lucide-react"
import type { BorrowRecord } from "@/types"

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

  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<BorrowRecord["status"] | "">("")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = borrowRecords
    .filter((r) => {
      if (search) {
        const device = devices.find((d) => d.id === r.deviceId)
        const haystack = `${device?.code ?? ""} ${r.borrower} ${r.customer} ${r.project}`.toLowerCase()
        if (!haystack.includes(search.toLowerCase())) return false
      }
      if (deptFilter && r.borrowerDepartment !== deptFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())

  const hasActiveFilters = deptFilter || statusFilter

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
              onClick={() => { setDeptFilter(""); setStatusFilter("") }}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <X size={14} />
              清除筛选
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
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
              const device = devices.find((d) => d.id === record.deviceId)
              return (
                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/devices/${record.deviceId}`} className="font-mono text-sm font-medium text-brand-600 hover:text-brand-700">
                      {device?.code ?? "-"}
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
    </div>
  )
}

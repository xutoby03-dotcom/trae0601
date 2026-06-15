import { useParams, Link, useNavigate } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { StatusBadge, AccountStatusBadge, FirmwareBadge } from "@/components/StatusBadge"
import { format } from "date-fns"
import {
  ArrowLeft,
  Edit,
  ArrowRightLeft,
  Package,
  HardDrive,
  UserCircle,
  Camera,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const devices = useStore((s) => s.devices)
  const borrowRecords = useStore((s) => s.borrowRecords)
  const device = devices.find((d) => d.id === id)

  if (!device) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-20">
        <p className="text-slate-400">未找到该样机</p>
        <Link to="/devices" className="btn-secondary mt-4 inline-flex">
          返回列表
        </Link>
      </div>
    )
  }

  const records = borrowRecords
    .filter((r) => r.deviceId === device.id)
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())

  const activeRecord = records.find((r) => r.status === "borrowed" || r.status === "overdue")

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">{device.code}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{device.model}</p>
          </div>
          <div className="ml-3">
            <StatusBadge status={device.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/devices/${device.id}/edit`} className="btn-secondary">
            <Edit size={16} />
            编辑
          </Link>
          {device.status === "idle" && (
            <Link to={`/borrow?deviceId=${device.id}`} className="btn-primary">
              <ArrowRightLeft size={16} />
              借出
            </Link>
          )}
          {activeRecord && (
            <Link to={`/borrow/return/${activeRecord.id}`} className="btn-primary">
              归还检查
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-brand-500" />
              <h3 className="font-display font-semibold text-slate-800">基本信息</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoField label="设备编号" value={device.code} mono />
              <InfoField label="设备型号" value={device.model} />
              <InfoField label="序列号" value={device.serialNumber} mono />
              <div>
                <span className="label-field">固件版本</span>
                <FirmwareBadge current={device.firmwareVersion} standard={device.standardFirmware} />
              </div>
              <div>
                <span className="label-field">账号状态</span>
                <AccountStatusBadge status={device.accountStatus} />
              </div>
              <InfoField label="归属部门" value={device.department} />
              <InfoField label="标准固件" value={device.standardFirmware} mono />
              <InfoField label="创建时间" value={format(new Date(device.createdAt), "yyyy-MM-dd HH:mm")} />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={18} className="text-brand-500" />
              <h3 className="font-display font-semibold text-slate-800">配件清单</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {device.accessories.length > 0 ? (
                device.accessories.map((acc) => (
                  <span key={acc} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {acc}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">暂无配件记录</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera size={18} className="text-brand-500" />
              <h3 className="font-display font-semibold text-slate-800">外观照片</h3>
            </div>
            {device.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {device.photos.map((url, i) => (
                  <img key={i} src={url} alt={`外观 ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Camera size={32} className="mb-2 opacity-50" />
                <span className="text-sm">暂无外观照片</span>
              </div>
            )}
          </div>

          {activeRecord && (
            <div className="card p-5 border-brand-200 bg-brand-50/30">
              <div className="flex items-center gap-2 mb-3">
                <UserCircle size={18} className="text-brand-600" />
                <h3 className="font-display font-semibold text-brand-800">当前借用</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">借用人</span>
                  <span className="font-medium text-slate-800">{activeRecord.borrower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">客户</span>
                  <span className="font-medium text-slate-800">{activeRecord.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">预计归还</span>
                  <span className="font-medium text-slate-800">
                    {format(new Date(activeRecord.expectedReturnDate), "yyyy-MM-dd")}
                  </span>
                </div>
                {activeRecord.hasSensitiveData && (
                  <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-medium">
                    ⚠ 含敏感数据
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5 mt-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-brand-500" />
          <h3 className="font-display font-semibold text-slate-800">外借历史</h3>
        </div>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="mt-1">
                  {record.status === "returned" ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-slate-800">{record.borrower}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-sm text-slate-600">{record.customer}</span>
                    {record.hasSensitiveData && (
                      <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded border border-red-200">敏感数据</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {format(new Date(record.borrowDate), "yyyy-MM-dd")} → {record.actualReturnDate ? format(new Date(record.actualReturnDate), "yyyy-MM-dd") : format(new Date(record.expectedReturnDate), "yyyy-MM-dd") + "（预计）"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{record.demoScenario}</div>
                  {record.returnCheck && !record.returnCheck.passed && (
                    <div className="mt-1 text-xs text-red-600">
                      归还检查未通过：{[
                        !record.returnCheck.accessoriesComplete && "配件不全",
                        !record.returnCheck.noNewScratches && "有划痕",
                        !record.returnCheck.dataCleared && "数据未清空",
                        !record.returnCheck.firmwareRolledBack && "固件未回滚",
                      ].filter(Boolean).join("、")}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  record.status === "returned"
                    ? "bg-emerald-50 text-emerald-700"
                    : record.status === "overdue"
                    ? "bg-red-50 text-red-700"
                    : "bg-brand-50 text-brand-700"
                }`}>
                  {record.status === "returned" ? "已归还" : record.status === "overdue" ? "逾期" : "借出中"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">暂无外借记录</p>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="label-field">{label}</span>
      <span className={`text-sm text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  )
}

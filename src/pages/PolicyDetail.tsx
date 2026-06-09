import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useInsuranceStore } from '@/stores/insuranceStore'
import { STATUS_CONFIG, INSURANCE_TYPE_COLORS, CLAIM_STATUSES } from '@/types/insurance'
import type { ClaimStatus } from '@/types/insurance'
import { ArrowLeft, Edit3, Trash2, RefreshCw, FileText, Plus, Calendar, DollarSign, User, Building, Upload, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type TabKey = 'info' | 'renewals' | 'claims'

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    policies,
    getPolicyStatus,
    getPolicyRenewals,
    getPolicyClaims,
    deletePolicy,
    addRenewal,
    deleteRenewal,
    addClaim,
    updateClaim,
    deleteClaim,
  } = useInsuranceStore()

  const [activeTab, setActiveTab] = useState<TabKey>('info')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRenewalForm, setShowRenewalForm] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)

  const [renewalForm, setRenewalForm] = useState({
    amount: '',
    paymentDate: '',
    voucher: '',
  })

  const [claimForm, setClaimForm] = useState({
    reason: '',
    materials: '',
    payoutAmount: '',
    status: '处理中' as ClaimStatus,
  })

  const policy = policies.find((p) => p.id === id)

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 text-lg mb-4">未找到该保单</p>
        <Link to="/" className="btn-primary">
          返回首页
        </Link>
      </div>
    )
  }

  const status = getPolicyStatus(policy)
  const statusConfig = STATUS_CONFIG[status]
  const renewals = getPolicyRenewals(policy.id)
  const claims = getPolicyClaims(policy.id)
  const typeColor = INSURANCE_TYPE_COLORS[policy.insuranceType]

  const handleDelete = () => {
    deletePolicy(policy.id)
    navigate('/')
  }

  const handleAddRenewal = () => {
    if (!renewalForm.amount || !renewalForm.paymentDate) return
    addRenewal({
      policyId: policy.id,
      amount: Number(renewalForm.amount),
      paymentDate: renewalForm.paymentDate,
      voucher: renewalForm.voucher,
    })
    setRenewalForm({ amount: '', paymentDate: '', voucher: '' })
    setShowRenewalForm(false)
  }

  const handleAddClaim = () => {
    if (!claimForm.reason) return
    addClaim({
      policyId: policy.id,
      reason: claimForm.reason,
      materials: claimForm.materials,
      payoutAmount: Number(claimForm.payoutAmount) || 0,
      status: claimForm.status,
    })
    setClaimForm({ reason: '', materials: '', payoutAmount: '', status: '处理中' })
    setShowClaimForm(false)
  }

  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setRenewalForm((prev) => ({ ...prev, voucher: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'yyyy年M月d日', { locale: zhCN })
    } catch {
      return dateStr
    }
  }

  const formatMoney = (amount: number) => amount.toLocaleString('zh-CN')

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: '保单信息', icon: <FileText size={16} /> },
    { key: 'renewals', label: '续费记录', icon: <RefreshCw size={16} /> },
    { key: 'claims', label: '理赔记录', icon: <FileText size={16} /> },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      {showPhotoPreview && policy.photo && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={policy.photo}
              alt="保单照片"
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <button
              onClick={() => setShowPhotoPreview(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary !px-3 !py-2">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {policy.insuranceType}
              <span
                className={`badge ${statusConfig.bg} ${statusConfig.color} border`}
              >
                {statusConfig.label}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{policy.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/policy/${policy.id}/edit`} className="btn-secondary !px-3 !py-2 flex items-center gap-1.5">
            <Edit3 size={15} />
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger !px-3 !py-2 flex items-center gap-1.5"
          >
            <Trash2 size={15} />
            删除
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="card p-4 border-red-200 bg-red-50">
          <p className="text-red-700 font-medium mb-3">确定要删除该保单吗？此操作不可撤销。</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="btn-danger">
              确认删除
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white text-[var(--navy-700)] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <FileText size={18} style={{ color: typeColor }} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">险种类型</p>
                  <p className="font-medium text-gray-900" style={{ color: typeColor }}>
                    {policy.insuranceType}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <User size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">被保人</p>
                  <p className="font-medium text-gray-900">{policy.insuredPerson}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Building size={18} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">保险公司</p>
                  <p className="font-medium text-gray-900">{policy.company}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">保额</p>
                  <p className="font-medium text-gray-900">{formatMoney(policy.coverageAmount)} 万元</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">保费</p>
                  <p className="font-medium text-gray-900">{formatMoney(policy.premium)} 元</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">缴费日期</p>
                  <p className="font-medium text-gray-900">{formatDate(policy.paymentDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">到期日期</p>
                  <p className="font-medium text-gray-900">{formatDate(policy.expiryDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                  <User size={18} className="text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">代理人</p>
                  <p className={`font-medium ${policy.agent ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                    {policy.agent || '未填写'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {policy.photo && (
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">保单照片</h3>
              <img
                src={policy.photo}
                alt="保单照片"
                className="w-full max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-100"
                onClick={() => setShowPhotoPreview(true)}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'renewals' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="section-title">续费记录</h3>
            <button
              onClick={() => setShowRenewalForm(!showRenewalForm)}
              className="btn-primary !px-3 !py-2 flex items-center gap-1.5 text-sm"
            >
              <Plus size={15} />
              添加续费
            </button>
          </div>

          {showRenewalForm && (
            <div className="card p-5 space-y-4">
              <h4 className="font-medium text-gray-800">新增续费记录</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">缴费金额 (元)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={renewalForm.amount}
                    onChange={(e) => setRenewalForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="请输入缴费金额"
                  />
                </div>
                <div>
                  <label className="form-label">缴费日期</label>
                  <input
                    type="date"
                    className="form-input"
                    value={renewalForm.paymentDate}
                    onChange={(e) => setRenewalForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">凭证上传</label>
                <div className="flex items-center gap-3">
                  <label className="btn-secondary !px-3 !py-2 flex items-center gap-1.5 text-sm cursor-pointer">
                    <Upload size={15} />
                    选择文件
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleVoucherUpload}
                    />
                  </label>
                  {renewalForm.voucher && (
                    <div className="flex items-center gap-2">
                      <img src={renewalForm.voucher} alt="凭证" className="h-10 w-10 rounded object-cover" />
                      <button
                        onClick={() => setRenewalForm((prev) => ({ ...prev, voucher: '' }))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddRenewal} className="btn-primary">
                  确认添加
                </button>
                <button onClick={() => setShowRenewalForm(false)} className="btn-secondary">
                  取消
                </button>
              </div>
            </div>
          )}

          {renewals.length === 0 ? (
            <div className="card p-8 text-center">
              <RefreshCw size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">暂无续费记录</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {renewals.map((renewal) => (
                  <div key={renewal.id} className="relative pl-12 animate-slide-in">
                    <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full bg-[var(--navy-400)] border-2 border-white shadow-sm" />
                    <div className="card p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-green-500" />
                            <span className="font-semibold text-gray-900">
                              {formatMoney(renewal.amount)} 元
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            {formatDate(renewal.paymentDate)}
                          </div>
                          {renewal.voucher && (
                            <img
                              src={renewal.voucher}
                              alt="缴费凭证"
                              className="h-16 rounded border border-gray-100"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => deleteRenewal(renewal.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="section-title">理赔记录</h3>
            <button
              onClick={() => setShowClaimForm(!showClaimForm)}
              className="btn-primary !px-3 !py-2 flex items-center gap-1.5 text-sm"
            >
              <Plus size={15} />
              添加理赔
            </button>
          </div>

          {showClaimForm && (
            <div className="card p-5 space-y-4">
              <h4 className="font-medium text-gray-800">新增理赔记录</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">理赔原因</label>
                  <input
                    type="text"
                    className="form-input"
                    value={claimForm.reason}
                    onChange={(e) => setClaimForm((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="请输入理赔原因"
                  />
                </div>
                <div>
                  <label className="form-label">理赔材料</label>
                  <input
                    type="text"
                    className="form-input"
                    value={claimForm.materials}
                    onChange={(e) => setClaimForm((prev) => ({ ...prev, materials: e.target.value }))}
                    placeholder="如：诊断书、发票等"
                  />
                </div>
                <div>
                  <label className="form-label">赔付金额 (元)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={claimForm.payoutAmount}
                    onChange={(e) => setClaimForm((prev) => ({ ...prev, payoutAmount: e.target.value }))}
                    placeholder="请输入赔付金额"
                  />
                </div>
                <div>
                  <label className="form-label">理赔状态</label>
                  <select
                    className="form-input"
                    value={claimForm.status}
                    onChange={(e) => setClaimForm((prev) => ({ ...prev, status: e.target.value as ClaimStatus }))}
                  >
                    {CLAIM_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddClaim} className="btn-primary">
                  确认添加
                </button>
                <button onClick={() => setShowClaimForm(false)} className="btn-secondary">
                  取消
                </button>
              </div>
            </div>
          )}

          {claims.length === 0 ? (
            <div className="card p-8 text-center">
              <FileText size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">暂无理赔记录</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {claims.map((claim) => {
                const statusStyles: Record<ClaimStatus, { bg: string; text: string }> = {
                  '处理中': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                  '已赔付': { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
                  '已拒赔': { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
                }
                const style = statusStyles[claim.status]

                return (
                  <div key={claim.id} className="card p-5 animate-fade-in">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{claim.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(claim.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge border ${style.bg} ${style.text}`}>
                          {claim.status}
                        </span>
                        <button
                          onClick={() => deleteClaim(claim.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {claim.materials && (
                        <div>
                          <span className="text-gray-500">理赔材料：</span>
                          <span className="text-gray-700">{claim.materials}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">赔付金额：</span>
                        <span className="font-medium text-gray-900">
                          {formatMoney(claim.payoutAmount)} 元
                        </span>
                      </div>
                    </div>
                    {claim.status === '处理中' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => updateClaim(claim.id, { status: '已赔付' })}
                          className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          标记已赔付
                        </button>
                        <button
                          onClick={() => updateClaim(claim.id, { status: '已拒赔' })}
                          className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          标记已拒赔
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

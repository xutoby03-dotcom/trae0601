import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  FileText,
  Receipt,
  ShieldAlert,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Monitor,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useWarrantyStore } from '../store/warrantyStore'
import {
  formatDate,
  getWarrantyStatus,
  getWarrantyEndDate,
  getDaysLeft,
  todayStr,
} from '../utils/dateUtils'
import { WARRANTY_STATUS_LABEL, WARRANTY_STATUS_COLOR } from '../utils/constants'
import type { MaintenanceRecord } from '../types'
import ImageUploader from '../components/ImageUploader'

interface RecordFormState {
  date: string
  fault: string
  repairShop: string
  cost: string
  coveredByWarranty: boolean
  repairOrderPhoto: string
  notes: string
}

const initialFormState: RecordFormState = {
  date: todayStr(),
  fault: '',
  repairShop: '',
  cost: '',
  coveredByWarranty: false,
  repairOrderPhoto: '',
  notes: '',
}

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const devices = useWarrantyStore((state) => state.devices)
  const getDeviceRecords = useWarrantyStore((state) => state.getDeviceRecords)
  const addMaintenanceRecord = useWarrantyStore((state) => state.addMaintenanceRecord)
  const updateMaintenanceRecord = useWarrantyStore((state) => state.updateMaintenanceRecord)
  const deleteMaintenanceRecord = useWarrantyStore((state) => state.deleteMaintenanceRecord)
  const deleteDevice = useWarrantyStore((state) => state.deleteDevice)

  const device = devices.find((d) => d.id === id)
  const records = device ? getDeviceRecords(device.id) : []

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [formState, setFormState] = useState<RecordFormState>(initialFormState)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showDeleteDeviceConfirm, setShowDeleteDeviceConfirm] = useState(false)
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (editingRecord) {
      setFormState({
        date: editingRecord.date,
        fault: editingRecord.fault,
        repairShop: editingRecord.repairShop,
        cost: String(editingRecord.cost),
        coveredByWarranty: editingRecord.coveredByWarranty,
        repairOrderPhoto: editingRecord.repairOrderPhoto || '',
        notes: editingRecord.notes || '',
      })
      setShowAddModal(true)
    }
  }, [editingRecord])

  if (!device) {
    return (
      <div className="empty-state" style={{ padding: '80px 20px' }}>
        <div className="empty-state-icon">📦</div>
        <div className="empty-state-title">设备不存在</div>
        <div className="empty-state-desc">该设备可能已被删除或不存在</div>
        <button
          onClick={() => navigate('/devices')}
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          <ArrowLeft size={18} style={{ marginRight: 6 }} />
          返回设备列表
        </button>
      </div>
    )
  }

  const status = getWarrantyStatus(device)
  const endDate = getWarrantyEndDate(device)
  const daysLeft = getDaysLeft(device)

  const badgeClass =
    status === 'in-warranty'
      ? 'badge-success'
      : status === 'expiring-soon'
      ? 'badge-warning'
      : 'badge-danger'

  const handleOpenAddModal = () => {
    setEditingRecord(null)
    setFormState(initialFormState)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingRecord(null)
  }

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.date || !formState.fault) return

    const recordData = {
      deviceId: device.id,
      date: formState.date,
      fault: formState.fault,
      repairShop: formState.repairShop,
      cost: Number(formState.cost) || 0,
      coveredByWarranty: formState.coveredByWarranty,
      repairOrderPhoto: formState.repairOrderPhoto || undefined,
      notes: formState.notes || undefined,
    }

    if (editingRecord) {
      updateMaintenanceRecord(editingRecord.id, recordData)
    } else {
      addMaintenanceRecord(recordData)
    }

    handleCloseModal()
  }

  const handleDeleteRecord = (recordId: string) => {
    deleteMaintenanceRecord(recordId)
    setDeleteRecordId(null)
  }

  const handleDeleteDevice = () => {
    deleteDevice(device.id)
    setShowDeleteDeviceConfirm(false)
    navigate('/devices')
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate('/devices')}
          className="btn btn-ghost"
          style={{ padding: '8px 12px' }}
        >
          <ArrowLeft size={18} style={{ marginRight: 6 }} />
          返回
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/devices/${device.id}/edit`} className="btn btn-secondary">
            <Edit size={16} style={{ marginRight: 6 }} />
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteDeviceConfirm(true)}
            className="btn btn-danger"
          >
            <Trash2 size={16} style={{ marginRight: 6 }} />
            删除
          </button>
        </div>
      </div>

      {status === 'expiring-soon' && (
        <div
          className="card card-padding"
          style={{
            marginBottom: 20,
            backgroundColor: '#fffbeb',
            border: '1px solid #fcd34d',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
              保修即将到期
            </div>
            <div style={{ fontSize: 14, color: '#b45309' }}>
              该设备还有 {daysLeft} 天保修到期，建议及时检查设备状态。
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: 20 }}>
        <div className="card card-padding">
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {device.devicePhoto ? (
                <img
                  src={device.devicePhoto}
                  alt={device.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Monitor size={40} style={{ color: '#9ca3af' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: 6,
                }}
              >
                {device.name}
              </h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                {device.brand} · {device.model}
              </p>
              <span className={`badge ${badgeClass}`}>
                {WARRANTY_STATUS_LABEL[status]}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: 14, color: '#374151' }}>
                品类：{device.category}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: 14, color: '#374151' }}>
                位置：{device.room}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: 14, color: '#374151' }}>
                购买日期：{formatDate(device.purchaseDate)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: 14, color: '#374151' }}>
                保修期限：{device.warrantyYears} 年
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Receipt size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: 14, color: '#374151' }}>
                购买渠道：{device.purchaseChannel}
              </span>
            </div>
            {device.notes && (
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: '#f9fafb',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#4b5563',
                  lineHeight: 1.6,
                }}
              >
                {device.notes}
              </div>
            )}
          </div>
        </div>

        <div className="card card-padding">
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#111827',
              marginBottom: 16,
            }}
          >
            保修状态
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderRadius: 12,
              backgroundColor:
                status === 'in-warranty'
                  ? '#ecfdf5'
                  : status === 'expiring-soon'
                  ? '#fffbeb'
                  : '#fef2f2',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                当前状态
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: WARRANTY_STATUS_COLOR[status],
                }}
              >
                {WARRANTY_STATUS_LABEL[status]}
              </div>
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert
                size={28}
                style={{ color: WARRANTY_STATUS_COLOR[status] }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 14, color: '#6b7280' }}>保修截止日期</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                {formatDate(endDate.toISOString().split('T')[0])}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 14, color: '#6b7280' }}>剩余天数</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: WARRANTY_STATUS_COLOR[status],
                }}
              >
                {daysLeft > 0 ? `${daysLeft} 天` : `已过期 ${Math.abs(daysLeft)} 天`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-padding" style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#111827',
            marginBottom: 16,
          }}
        >
          凭证照片
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              发票照片
            </div>
            {device.invoicePhoto ? (
              <div
                onClick={() => setPreviewImage(device.invoicePhoto!)}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <img
                  src={device.invoicePhoto}
                  alt="发票照片"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                  color: '#9ca3af',
                  border: '1px dashed var(--border)',
                }}
              >
                <Receipt size={32} />
                <span style={{ fontSize: 13 }}>暂无发票照片</span>
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              保修卡照片
            </div>
            {device.warrantyCardPhoto ? (
              <div
                onClick={() => setPreviewImage(device.warrantyCardPhoto!)}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <img
                  src={device.warrantyCardPhoto}
                  alt="保修卡照片"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                  color: '#9ca3af',
                  border: '1px dashed var(--border)',
                }}
              >
                <FileText size={32} />
                <span style={{ fontSize: 13 }}>暂无保修卡照片</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card card-padding">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#111827',
            }}
          >
            维修记录 ({records.length})
          </h2>
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={16} style={{ marginRight: 6 }} />
            添加维修记录
          </button>
        </div>

        {records.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {records.map((record) => (
              <div
                key={record.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid var(--border-light)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Calendar size={14} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
                        {formatDate(record.date)}
                      </span>
                      {record.coveredByWarranty && (
                        <span
                          className="badge badge-success"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <CheckCircle size={12} />
                          保修覆盖
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: 6,
                      }}
                    >
                      {record.fault}
                    </div>
                    {record.repairShop && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          color: '#6b7280',
                          marginBottom: 4,
                        }}
                      >
                        <MapPin size={13} />
                        {record.repairShop}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: '#6b7280',
                      }}
                    >
                      <DollarSign size={13} />
                      花费：¥{record.cost.toLocaleString()}
                    </div>
                    {record.notes && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 10,
                          backgroundColor: '#f9fafb',
                          borderRadius: 8,
                          fontSize: 13,
                          color: '#4b5563',
                          lineHeight: 1.6,
                        }}
                      >
                        {record.notes}
                      </div>
                    )}
                    {record.repairOrderPhoto && (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#6b7280',
                            marginBottom: 6,
                          }}
                        >
                          维修单照片
                        </div>
                        <img
                          src={record.repairOrderPhoto}
                          alt="维修单"
                          onClick={() => setPreviewImage(record.repairOrderPhoto!)}
                          style={{
                            width: 120,
                            height: 90,
                            objectFit: 'cover',
                            borderRadius: 8,
                            cursor: 'pointer',
                            border: '1px solid var(--border-light)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteRecordId(record.id)}
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">🔧</div>
            <div className="empty-state-title">暂无维修记录</div>
            <div className="empty-state-desc">还没有任何维修记录</div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={handleCloseModal}
        >
          <div
            className="card card-padding"
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                {editingRecord ? '编辑维修记录' : '添加维修记录'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">维修日期 *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formState.date}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">故障描述 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入故障描述"
                  value={formState.fault}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, fault: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">维修点</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入维修点名称"
                  value={formState.repairShop}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, repairShop: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">维修费用 (元)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={formState.cost}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, cost: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formState.coveredByWarranty}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        coveredByWarranty: e.target.checked,
                      }))
                    }
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    是否在保修范围内
                  </span>
                </label>
              </div>

              <ImageUploader
                label="维修单照片"
                value={formState.repairOrderPhoto}
                onChange={(val) =>
                  setFormState((prev) => ({ ...prev, repairOrderPhoto: val }))
                }
              />

              <div className="form-group">
                <label className="form-label">备注</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="请输入备注信息"
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  justifyContent: 'flex-end',
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? '保存修改' : '添加记录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 20,
            cursor: 'pointer',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt="预览"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showDeleteDeviceConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowDeleteDeviceConfirm(false)}
        >
          <div
            className="card card-padding"
            style={{ width: '100%', maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                  确认删除设备？
                </h3>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              删除设备将同时删除该设备的所有维修记录，此操作无法撤销。
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteDeviceConfirm(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDeleteDevice} className="btn btn-danger">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRecordId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setDeleteRecordId(null)}
        >
          <div
            className="card card-padding"
            style={{ width: '100%', maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                  确认删除维修记录？
                </h3>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              此操作无法撤销。
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteRecordId(null)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteRecord(deleteRecordId)}
                className="btn btn-danger"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

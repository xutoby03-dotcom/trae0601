import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { useWarrantyStore } from '../store/warrantyStore'
import { todayStr } from '../utils/dateUtils'
import { DEVICE_CATEGORIES, ROOMS } from '../utils/constants'
import ImageUploader from '../components/ImageUploader'
import type { Device } from '../types'

interface FormState {
  name: string
  brand: string
  model: string
  category: string
  room: string
  purchaseDate: string
  warrantyYears: number
  purchaseChannel: string
  notes: string
  devicePhoto: string
  invoicePhoto: string
  warrantyCardPhoto: string
}

export default function DeviceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const devices = useWarrantyStore((state) => state.devices)
  const addDevice = useWarrantyStore((state) => state.addDevice)
  const updateDevice = useWarrantyStore((state) => state.updateDevice)

  const device = isEditMode ? devices.find((d) => d.id === id) : undefined

  const [formData, setFormData] = useState<FormState>({
    name: '',
    brand: '',
    model: '',
    category: DEVICE_CATEGORIES[0],
    room: ROOMS[0],
    purchaseDate: todayStr(),
    warrantyYears: 1,
    purchaseChannel: '',
    notes: '',
    devicePhoto: '',
    invoicePhoto: '',
    warrantyCardPhoto: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (isEditMode && device) {
      setFormData({
        name: device.name,
        brand: device.brand,
        model: device.model,
        category: device.category,
        room: device.room,
        purchaseDate: device.purchaseDate,
        warrantyYears: device.warrantyYears,
        purchaseChannel: device.purchaseChannel,
        notes: device.notes || '',
        devicePhoto: device.devicePhoto || '',
        invoicePhoto: device.invoicePhoto || '',
        warrantyCardPhoto: device.warrantyCardPhoto || '',
      })
    }
  }, [isEditMode, device])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入设备名称'
    }
    if (!formData.brand.trim()) {
      newErrors.brand = '请输入品牌'
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = '请选择购买日期'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const deviceData: Omit<Device, 'id' | 'createdAt'> = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      category: formData.category,
      room: formData.room,
      purchaseDate: formData.purchaseDate,
      warrantyYears: Number(formData.warrantyYears),
      purchaseChannel: formData.purchaseChannel.trim(),
      notes: formData.notes.trim() || undefined,
      devicePhoto: formData.devicePhoto || undefined,
      invoicePhoto: formData.invoicePhoto || undefined,
      warrantyCardPhoto: formData.warrantyCardPhoto || undefined,
    }

    if (isEditMode && id) {
      updateDevice(id, deviceData)
      navigate(`/devices/${id}`)
    } else {
      addDevice(deviceData)
      const updatedDevices = useWarrantyStore.getState().devices
      const newId = updatedDevices[updatedDevices.length - 1]?.id
      navigate(`/devices/${newId}`)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const handleChange = (field: keyof FormState, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (isEditMode && !device) {
    return (
      <div className="card card-padding">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-title">设备不存在</div>
          <div className="empty-state-desc">未找到对应的设备信息</div>
          <button className="btn btn-primary" onClick={() => navigate('/devices')}>
            返回设备列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEditMode ? '编辑设备' : '添加设备'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card card-padding">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                设备名称 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例如：客厅电视"
              />
              {errors.name && (
                <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                品牌 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="例如：小米"
              />
              {errors.brand && (
                <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.brand}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">型号</label>
              <input
                type="text"
                className="form-input"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="例如：L65M7-ES"
              />
            </div>

            <div className="form-group">
              <label className="form-label">类别</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {DEVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">房间</label>
              <select
                className="form-select"
                value={formData.room}
                onChange={(e) => handleChange('room', e.target.value)}
              >
                {ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                购买日期 <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
              />
              {errors.purchaseDate && (
                <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.purchaseDate}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">保修年限（年）</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.5"
                value={formData.warrantyYears}
                onChange={(e) => handleChange('warrantyYears', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">购买渠道</label>
              <input
                type="text"
                className="form-input"
                value={formData.purchaseChannel}
                onChange={(e) => handleChange('purchaseChannel', e.target.value)}
                placeholder="例如：京东自营"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="填写其他需要记录的信息..."
            />
          </div>

          <div className="form-row">
            <ImageUploader
              label="设备照片"
              value={formData.devicePhoto}
              onChange={(val) => handleChange('devicePhoto', val)}
            />
            <ImageUploader
              label="发票照片"
              value={formData.invoicePhoto}
              onChange={(val) => handleChange('invoicePhoto', val)}
            />
            <ImageUploader
              label="保修卡照片"
              value={formData.warrantyCardPhoto}
              onChange={(val) => handleChange('warrantyCardPhoto', val)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={handleCancel}>
              <ArrowLeft size={16} />
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              {isEditMode ? '保存修改' : '保存'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

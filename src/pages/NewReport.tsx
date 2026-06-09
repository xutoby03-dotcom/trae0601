import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReportStore } from '../store/reportStore'
import type { ItemType, OccupyLocation } from '../types'
import { ITEM_TYPE_OPTIONS, OCCUPY_LOCATION_OPTIONS, calculateFireRisk, generateGroupKey } from '../types'
import { ArrowLeft, Camera, AlertTriangle, CheckCircle } from 'lucide-react'

export default function NewReport() {
  const navigate = useNavigate()
  const addReport = useReportStore((s) => s.addReport)
  const getRecurrenceCount = useReportStore((s) => s.getRecurrenceCount)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [itemType, setItemType] = useState<ItemType>('纸箱')
  const [occupyLocation, setOccupyLocation] = useState<OccupyLocation>('楼道')
  const [photo, setPhoto] = useState('')
  const [discoveryTime, setDiscoveryTime] = useState(new Date().toISOString().slice(0, 16))
  const [blocksPassage, setBlocksPassage] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reportId, setReportId] = useState('')

  const fireRisk = calculateFireRisk(itemType, occupyLocation, blocksPassage)
  const groupKey = generateGroupKey(building, floor, occupyLocation)
  const recurrence = building && floor ? getRecurrenceCount(groupKey) : 0

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhoto(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!building || !floor) return
    const id = addReport({
      building,
      floor,
      itemType,
      occupyLocation,
      photo,
      discoveryTime: new Date(discoveryTime).toISOString(),
      blocksPassage,
    })
    setReportId(id)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="page-container">
        <div className="success-card">
          <CheckCircle size={48} color="#10b981" />
          <h2>提交成功</h2>
          <p className="text-muted">报告编号：{reportId}</p>
          {fireRisk === '高' && (
            <div className="alert-card alert-high">
              <AlertTriangle size={16} />
              <span>该物品消防风险等级较高，物业将优先处理</span>
            </div>
          )}
          {recurrence > 0 && (
            <div className="alert-card alert-warning">
              <span>🔄 该位置已有 {recurrence} 次堆物记录，已标记为复发</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>发布堆物提醒</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h3>📍 位置信息</h3>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>楼栋号</label>
              <input
                type="text"
                placeholder="如：3号楼"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label>楼层</label>
              <input
                type="text"
                placeholder="如：5层"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📦 物品信息</h3>
          <div className="form-group">
            <label>物品类型</label>
            <div className="chip-group">
              {ITEM_TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${itemType === t ? 'chip-active' : ''}`}
                  onClick={() => setItemType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>占用位置</label>
            <div className="chip-group">
              {OCCUPY_LOCATION_OPTIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`chip ${occupyLocation === l ? 'chip-active' : ''} ${l === '消防通道' ? 'chip-danger' : ''}`}
                  onClick={() => setOccupyLocation(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📸 现场照片</h3>
          <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
            {photo ? (
              <img src={photo} alt="现场照片" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <Camera size={32} />
                <span>点击拍照或上传照片</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              hidden
            />
          </div>
        </div>

        <div className="form-section">
          <h3>⏰ 发现时间</h3>
          <div className="form-group">
            <input
              type="datetime-local"
              value={discoveryTime}
              onChange={(e) => setDiscoveryTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>🚶 是否影响通行</h3>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${blocksPassage ? 'toggle-yes' : ''}`}
              onClick={() => setBlocksPassage(true)}
            >
              是，影响通行
            </button>
            <button
              type="button"
              className={`toggle-btn ${!blocksPassage ? 'toggle-no' : ''}`}
              onClick={() => setBlocksPassage(false)}
            >
              否，暂不影响
            </button>
          </div>
        </div>

        <div className="risk-preview">
          <span>预估消防风险：</span>
          <span className={`risk-badge risk-${fireRisk === '高' ? 'high' : fireRisk === '中' ? 'medium' : 'low'}`}>
            {fireRisk}
          </span>
          {recurrence > 0 && (
            <span className="recurrence-badge">🔄 复发 {recurrence} 次</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!building || !floor}>
          提交提醒
        </button>
      </form>
    </div>
  )
}

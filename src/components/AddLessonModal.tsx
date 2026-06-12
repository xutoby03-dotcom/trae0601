import React, { useState } from 'react'
import { X, Camera } from 'lucide-react'
import { useTrialStore } from '../store/trialStore'
import { CATEGORY_OPTIONS, CATEGORY_ICONS, type CourseCategory } from '../types/trial'

interface Props {
  onClose: () => void
}

export const AddLessonModal: React.FC<Props> = ({ onClose }) => {
  const { addLesson } = useTrialStore()

  const [organization, setOrganization] = useState('')
  const [courseName, setCourseName] = useState('')
  const [category, setCategory] = useState<CourseCategory>('画画')
  const [ageGroup, setAgeGroup] = useState('')
  const [trialTime, setTrialTime] = useState('')
  const [address, setAddress] = useState('')
  const [teacher, setTeacher] = useState('')
  const [fee, setFee] = useState('')
  const [classroomPhoto, setClassroomPhoto] = useState('')
  const [prepText, setPrepText] = useState('')
  const [prepItems, setPrepItems] = useState<string[]>([])

  const handleSubmit = () => {
    if (!organization || !courseName || !trialTime || !address) {
      alert('请填写必填项：机构、课程名、试听时间、地址')
      return
    }

    const photoUrl = classroomPhoto ||
      `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop`

    addLesson({
      organization,
      courseName,
      category,
      ageGroup: ageGroup || '请咨询',
      trialTime,
      address,
      teacher: teacher || '待安排',
      fee: Number(fee) || 0,
      classroomPhoto: photoUrl,
      prepItems
    })

    onClose()
  }

  const addPrep = () => {
    if (prepText.trim()) {
      setPrepItems([...prepItems, prepText.trim()])
      setPrepText('')
    }
  }

  const removePrep = (idx: number) => {
    setPrepItems(prepItems.filter((_, i) => i !== idx))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2>🎒 新增试听记录</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="form-section">
          <h3>🏢 基本信息</h3>
          <div className="form-group">
            <label>机构名称 *</label>
            <input
              type="text"
              placeholder="如：彩虹画室"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>课程名称 *</label>
            <input
              type="text"
              placeholder="如：创意儿童画启蒙班"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>课程类别</label>
            <div className="chip-group">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`chip ${category === opt ? 'chip-active' : ''}`}
                  onClick={() => setCategory(opt)}
                  type="button"
                >
                  {CATEGORY_ICONS[opt]} {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>适合年龄</label>
              <input
                type="text"
                placeholder="如：4-6岁"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>授课老师</label>
              <input
                type="text"
                placeholder="如：李老师"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>⏰ 时间地点</h3>
          <div className="form-group">
            <label>试听时间 *</label>
            <input
              type="datetime-local"
              value={trialTime}
              onChange={(e) => setTrialTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>试听地址 *</label>
            <input
              type="text"
              placeholder="详细地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>试听费用（元）</label>
              <input
                type="number"
                placeholder="0 表示免费"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📷 教室照片</h3>
          {classroomPhoto ? (
            <div className="photo-upload" onClick={() => setClassroomPhoto('')}>
              <img src={classroomPhoto} alt="预览" className="photo-preview" />
            </div>
          ) : (
            <div className="photo-upload">
              <div className="photo-placeholder">
                <Camera size={32} />
                <span>点击输入图片URL</span>
              </div>
            </div>
          )}
          <div className="form-group" style={{ marginTop: 10 }}>
            <label>或粘贴图片链接</label>
            <input
              type="text"
              placeholder="https://..."
              value={classroomPhoto}
              onChange={(e) => setClassroomPhoto(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>📝 试听前准备（可选）</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="输入准备事项，回车添加"
              value={prepText}
              onChange={(e) => setPrepText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPrep()
                }
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addPrep}
              style={{ flex: 'none', padding: '10px 16px' }}
            >
              添加
            </button>
          </div>
          {prepItems.length > 0 && (
            <div className="prep-list">
              {prepItems.map((item, idx) => (
                <div key={idx} className="prep-item" style={{ cursor: 'default' }}>
                  <span className="prep-text">{item}</span>
                  <button
                    type="button"
                    onClick={() => removePrep(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            保存试听
          </button>
        </div>
      </div>
    </div>
  )
}

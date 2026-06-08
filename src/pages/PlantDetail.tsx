import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadPlants, deletePlant, loadGrowthRecords, addGrowthRecord, deleteGrowthRecord, getPlantStatus, checkLightMismatch, fileToBase64, loadCareTasks, completeTask } from '../utils/storage'
import { Plant, GrowthRecord, CareTask, LIGHT_LABELS } from '../types'
import { format, parseISO, differenceInDays } from 'date-fns'

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const photoRef = useRef<HTMLInputElement>(null)
  const [plant, setPlant] = useState<Plant | null>(null)
  const [records, setRecords] = useState<GrowthRecord[]>([])
  const [tasks, setTasks] = useState<CareTask[]>([])
  const [newNote, setNewNote] = useState('')
  const [newPhoto, setNewPhoto] = useState('')
  const [showAddRecord, setShowAddRecord] = useState(false)

  const loadData = () => {
    if (!id) return
    const plants = loadPlants()
    const found = plants.find(p => p.id === id)
    if (!found) { navigate('/'); return }
    setPlant(found)
    setRecords(loadGrowthRecords().filter(r => r.plantId === id).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()))
    setTasks(loadCareTasks().filter(t => t.plantId === id && !t.completed))
  }

  useEffect(() => { loadData() }, [id])

  const statuses = useMemo(() => {
    if (!plant) return []
    const s = getPlantStatus(plant)
    const lm = checkLightMismatch(plant)
    if (lm && !s.includes('low_light')) s.push('low_light' as any)
    return s
  }, [plant])

  const handleDelete = () => {
    if (!id) return
    if (confirm('确定要删除这盆植物吗？所有相关记录也将被删除。')) {
      deletePlant(id)
      navigate('/')
    }
  }

  const handleAddRecord = () => {
    if (!id || (!newNote.trim() && !newPhoto)) return
    addGrowthRecord(id, newPhoto, newNote.trim())
    setNewNote('')
    setNewPhoto('')
    setShowAddRecord(false)
    loadData()
  }

  const handleDeleteRecord = (recordId: string) => {
    deleteGrowthRecord(recordId)
    loadData()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await fileToBase64(file)
      setNewPhoto(base64)
    }
  }

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId)
    loadData()
  }

  if (!plant) return null

  const daysSinceWater = differenceInDays(new Date(), parseISO(plant.lastWateredDate))
  const daysSinceFertilize = differenceInDays(new Date(), parseISO(plant.lastFertilizedDate))

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/" style={{ fontSize: 14, color: 'var(--green-600)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ← 返回植物角
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{
            width: '100%',
            height: 280,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--green-100), var(--green-200))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {plant.photo ? (
              <img src={plant.photo} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 80 }}>🌱</span>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{plant.name}</h2>
          </div>
          <div style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 16 }}>
            {plant.variety || '未设品种'} · {plant.location}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--blue-50)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 14, color: 'var(--blue-500)' }}>💧 浇水</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: daysSinceWater >= plant.waterCycleDays ? 'var(--red-500)' : 'var(--blue-500)' }}>
                {daysSinceWater}天前 · 每{plant.waterCycleDays}天
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--purple-50)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 14, color: 'var(--purple-500)' }}>🧪 施肥</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: daysSinceFertilize >= plant.fertilizeCycleDays ? 'var(--red-500)' : 'var(--purple-500)' }}>
                {daysSinceFertilize}天前 · 每{plant.fertilizeCycleDays}天
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--amber-50)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 14, color: 'var(--amber-600)' }}>☀️ 光照</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber-600)' }}>
                {LIGHT_LABELS[plant.lightPreference]}
              </span>
            </div>
            {plant.repotDate && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 14, color: 'var(--green-600)' }}>🏺 换盆</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-600)' }}>
                  {format(parseISO(plant.repotDate), 'yyyy年M月d日')}
                </span>
              </div>
            )}
          </div>

          {tasks.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>待办事项</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tasks.map(task => (
                  <div key={task.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: task.type === 'water' ? 'var(--blue-50)' : task.type === 'fertilize' ? 'var(--purple-50)' : 'var(--amber-50)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span>{task.type === 'water' ? '💧' : task.type === 'fertilize' ? '🧪' : '🏺'}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>
                      {task.type === 'water' ? '浇水' : task.type === 'fertilize' ? '施肥' : '换盆'}
                      <span style={{ color: 'var(--gray-400)', marginLeft: 6 }}>
                        {format(parseISO(task.scheduledDate), 'M月d日')}
                      </span>
                    </span>
                    <button className="btn btn-sm btn-primary" onClick={() => handleCompleteTask(task.id)}>✓ 完成</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/edit/${plant.id}`} className="btn btn-secondary btn-sm">✏️ 编辑</Link>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 删除</button>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>📸 成长记录</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddRecord(!showAddRecord)}>
            + 添加记录
          </button>
        </div>

        {showAddRecord && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius)',
            padding: 20,
            boxShadow: 'var(--shadow)',
            marginBottom: 20,
          }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>拍照记录</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className="photo-upload" onClick={() => photoRef.current?.click()} style={{ width: 100, height: 100 }}>
                  {newPhoto ? (
                    <img src={newPhoto} alt="新照片" />
                  ) : (
                    <>
                      <span className="icon" style={{ fontSize: 20 }}>📷</span>
                      <span className="text">上传</span>
                    </>
                  )}
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="记录今天的观察..."
                    style={{
                      width: '100%',
                      padding: 10,
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 14,
                      minHeight: 80,
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddRecord(false)}>取消</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddRecord}>保存记录</button>
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
            <div>暂无成长记录，点击上方按钮开始记录</div>
          </div>
        ) : (
          <div className="timeline">
            {records.map(record => (
              <div key={record.id} className="timeline-item">
                <div className="timeline-date">
                  {format(parseISO(record.date), 'yyyy年M月d日 HH:mm')}
                </div>
                <div className="timeline-content">
                  {record.photo && (
                    <img src={record.photo} alt="" className="timeline-photo" />
                  )}
                  <div className="timeline-note">{record.note}</div>
                  <button
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: 'var(--gray-400)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    删除记录
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

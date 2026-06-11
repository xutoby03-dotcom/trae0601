import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { Send, Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import type { Application } from '@/types'

const SIZE_OPTIONS = ['A1', 'A2', 'A3', 'A4']

const STATUS_MAP: Record<Application['status'], { label: string; className: string }> = {
  pending: { label: '待审核', className: 'status-pending' },
  approved: { label: '已通过', className: 'status-approved' },
  rejected: { label: '已拒绝', className: 'status-rejected' },
  expired: { label: '已过期', className: 'status-expired' },
}

export default function Apply() {
  const { applications, boards, currentUser, addApplication, getConflicts, uploadPostedPhoto, uploadRemovedPhoto, confirmRemoval } = useStore()
  const [activityName, setActivityName] = useState('')
  const [boardId, setBoardId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [size, setSize] = useState('A1')
  const [imageUrl, setImageUrl] = useState('')
  const [contact, setContact] = useState('')
  const [conflicts, setConflicts] = useState<{ activityName: string; overlap: string }[]>([])
  const [submitted, setSubmitted] = useState(false)
  const postedInputRef = useRef<HTMLInputElement>(null)
  const removedInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<{ id: string; type: 'posted' | 'removed' } | null>(null)

  const myApps = applications.filter(a => a.clubName === currentUser?.name)

  const resetForm = () => {
    setActivityName('')
    setBoardId('')
    setStartDate('')
    setEndDate('')
    setSize('A1')
    setImageUrl('')
    setContact('')
    setConflicts([])
    setSubmitted(false)
  }

  const handleSubmit = () => {
    if (!currentUser || !activityName || !boardId || !startDate || !endDate || !contact) return

    const allConflicts = getConflicts()
    const related = allConflicts.filter(c => {
      const involvesNew = c.boardId === boardId &&
        new Date(startDate) <= new Date(c.overlapEnd) &&
        new Date(endDate) >= new Date(c.overlapStart)
      return involvesNew
    })

    if (related.length > 0 && !submitted) {
      setConflicts(related.map(c => ({
        activityName: c.applicationA.boardId === boardId ? c.applicationA.activityName : c.applicationB.activityName,
        overlap: `${c.overlapStart} ~ ${c.overlapEnd}`,
      })))
      setSubmitted(true)
      return
    }

    addApplication({
      activityName,
      clubName: currentUser.name,
      boardId,
      startDate,
      endDate,
      size,
      imageUrl,
      contact,
    })
    resetForm()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTarget) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (uploadTarget.type === 'posted') {
        uploadPostedPhoto(uploadTarget.id, dataUrl)
      } else {
        uploadRemovedPhoto(uploadTarget.id, dataUrl)
      }
      setUploadTarget(null)
    }
    reader.readAsDataURL(file)
  }

  const triggerUpload = (id: string, type: 'posted' | 'removed') => {
    setUploadTarget({ id, type })
    setTimeout(() => {
      if (type === 'posted' && postedInputRef.current) postedInputRef.current.click()
      if (type === 'removed' && removedInputRef.current) removedInputRef.current.click()
    }, 0)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <input ref={postedInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={removedInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">申请表单</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动名称</label>
            <input type="text" value={activityName} onChange={e => setActivityName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">社团名称</label>
            <input type="text" value={currentUser?.name ?? ''} readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">展板区域</label>
            <select value={boardId} onChange={e => setBoardId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择展板</option>
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name} - {b.location}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">海报尺寸</label>
            <select value={size} onChange={e => setSize(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电子图</label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="请输入海报图片链接"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
            <input type="text" value={contact} onChange={e => setContact(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">检测到时间冲突：</p>
              {conflicts.map((c, i) => (
                <p key={i}>{c.activityName}（重叠时段：{c.overlap}）</p>
              ))}
              <p>仍可提交，但可能被拒绝。</p>
            </div>
          </div>
        )}

        <button onClick={handleSubmit}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Send className="w-4 h-4" />
          提交申请
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">我的申请列表</h2>
        {myApps.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无申请记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 px-3">活动名称</th>
                  <th className="text-left py-2 px-3">展板</th>
                  <th className="text-left py-2 px-3">起止日期</th>
                  <th className="text-left py-2 px-3">尺寸</th>
                  <th className="text-left py-2 px-3">状态</th>
                  <th className="text-left py-2 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map(app => {
                  const board = boards.find(b => b.id === app.boardId)
                  const statusInfo = STATUS_MAP[app.status]
                  const isExpired = app.endDate < today
                  return (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 px-3">{app.activityName}</td>
                      <td className="py-2 px-3">{board ? `${board.name}` : app.boardId}</td>
                      <td className="py-2 px-3">{format(new Date(app.startDate), 'yyyy-MM-dd')} ~ {format(new Date(app.endDate), 'yyyy-MM-dd')}</td>
                      <td className="py-2 px-3">{app.size}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {app.status === 'approved' && !app.postedPhotoUrl && (
                          <button onClick={() => triggerUpload(app.id, 'posted')}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs">
                            <Upload className="w-3 h-3" /> 补传张贴照片
                          </button>
                        )}
                        {app.status === 'approved' && app.postedPhotoUrl && !app.removedPhotoUrl && (
                          <img src={app.postedPhotoUrl} alt="张贴照片" className="w-10 h-10 object-cover rounded" />
                        )}
                        {app.status === 'approved' && isExpired && !app.removedPhotoUrl && (
                          <button onClick={() => confirmRemoval(app.id)}
                            className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-xs ml-2">
                            <CheckCircle className="w-3 h-3" /> 确认下架
                          </button>
                        )}
                        {app.status === 'expired' && !app.removedPhotoUrl && (
                          <button onClick={() => triggerUpload(app.id, 'removed')}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs">
                            <Upload className="w-3 h-3" /> 上传下架照片
                          </button>
                        )}
                        {app.status === 'expired' && app.removedPhotoUrl && (
                          <img src={app.removedPhotoUrl} alt="下架照片" className="w-10 h-10 object-cover rounded" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

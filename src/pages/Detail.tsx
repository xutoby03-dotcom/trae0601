import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePetStore } from '@/store/usePetStore'
import type { PetStatus, Clue } from '@/types'
import { STATUS_LABELS, TYPE_LABELS, GENDER_LABELS, STATUS_COLORS, TYPE_COLORS } from '@/types'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  User,
  X,
  Camera,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_ORDER: PetStatus[] = ['searching', 'clue', 'reunited']

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { posts, clues, statusLogs, changeStatus, addClue, deletePost } = usePetStore()

  const post = posts.find((p) => p.id === id)
  const postClues = clues.filter((c) => c.postId === id)
  const postLogs = statusLogs.filter((s) => s.postId === id)

  const [mainPhoto, setMainPhoto] = useState(0)
  const [showPoster, setShowPoster] = useState(false)
  const [clueContent, setClueContent] = useState('')
  const [clueSeenTime, setClueSeenTime] = useState('')
  const [clueSeenLocation, setClueSeenLocation] = useState('')
  const [cluePhotos, setCluePhotos] = useState<string[]>([])
  const clueFileRef = useRef<HTMLInputElement>(null)

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <p className="text-lg font-semibold">404</p>
        <p className="mt-1">未找到该帖子</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          返回首页
        </button>
      </div>
    )
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(post.status)

  function handleStatusChange(nextStatus: PetStatus) {
    changeStatus(post.id, nextStatus)
  }

  function handleAddClue() {
    if (!clueContent.trim()) return
    addClue({
      postId: post.id,
      content: clueContent.trim(),
      photos: cluePhotos,
      seenTime: clueSeenTime ? new Date(clueSeenTime).toISOString() : '',
      seenLocation: clueSeenLocation.trim(),
    })
    setClueContent('')
    setClueSeenTime('')
    setClueSeenLocation('')
    setCluePhotos([])
  }

  function handleCluePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const remaining = 3 - cluePhotos.length
    if (remaining <= 0) return
    const toProcess = Array.from(files).slice(0, remaining)
    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        if (result) {
          setCluePhotos((prev) => (prev.length < 3 ? [...prev, result] : prev))
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function handleDelete() {
    if (window.confirm('确认删除该帖子？删除后不可恢复。')) {
      deletePost(post.id)
      navigate('/')
    }
  }

  async function handleDownloadPoster() {
    const el = document.getElementById('poster')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const link = document.createElement('a')
    link.download = `${post.name}-寻宠启事.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/create/${post.id}`)}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {post.photos.length > 0 && (
        <div className="mb-6">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={post.photos[mainPhoto]}
              alt={post.name}
              className="w-full h-full object-cover"
            />
          </div>
          {post.photos.length > 1 && (
            <div className="flex gap-2 mt-2">
              {post.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setMainPhoto(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0',
                    i === mainPhoto ? 'border-blue-500' : 'border-transparent'
                  )}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-bold">{post.name}</h1>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: TYPE_COLORS[post.type] }}
          >
            {TYPE_LABELS[post.type]}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: STATUS_COLORS[post.status] }}
          >
            {STATUS_LABELS[post.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          {post.breed && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>品种：{post.breed}</span>
            </div>
          )}
          {post.gender && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>性别：{GENDER_LABELS[post.gender]}</span>
            </div>
          )}
          {post.furColor && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>毛色：{post.furColor}</span>
            </div>
          )}
          {post.size && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>体型：{post.size}</span>
            </div>
          )}
          {post.lostTime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>时间：{formatDateTime(post.lostTime)}</span>
            </div>
          )}
          {post.locationDesc && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>地点：{post.locationDesc}</span>
            </div>
          )}
        </div>

        {post.description && (
          <p className="mt-3 text-gray-700 text-sm leading-relaxed">{post.description}</p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
          {post.contactName && (
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              <span>联系人：{post.contactName}</span>
            </div>
          )}
          {post.contactPhone && (
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>电话：{post.contactPhone}</span>
            </div>
          )}
          {post.contactWechat && (
            <div className="flex items-center gap-2 text-gray-700">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span>微信：{post.contactWechat}</span>
            </div>
          )}
          {post.reward && (
            <div className="flex items-center gap-2 text-orange-600 font-medium">
              <span>酬谢：{post.reward}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg overflow-hidden">
        <MapContainer
          center={[post.lat, post.lng]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: 200 }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[post.lat, post.lng]}>
            <Popup>{post.locationDesc || post.name}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">状态追踪</h2>
        <div className="flex items-center justify-between mb-4">
          {STATUS_ORDER.map((status, i) => (
            <div key={status} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white',
                    i <= currentStatusIndex ? 'opacity-100' : 'opacity-30'
                  )}
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1',
                    i <= currentStatusIndex ? 'text-gray-900 font-medium' : 'text-gray-400'
                  )}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    i < currentStatusIndex ? 'bg-green-400' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        {postLogs.length > 0 && (
          <div className="space-y-2">
            {postLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <Clock className="w-3 h-3" />
                <span>
                  {formatDateTime(log.changedAt)}：{STATUS_LABELS[log.fromStatus]} →{' '}
                  {STATUS_LABELS[log.toStatus]}
                </span>
              </div>
            ))}
          </div>
        )}
        {currentStatusIndex < STATUS_ORDER.length - 1 && (
          <div className="mt-3">
            <button
              onClick={() => handleStatusChange(STATUS_ORDER[currentStatusIndex + 1])}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: STATUS_COLORS[STATUS_ORDER[currentStatusIndex + 1]] }}
            >
              更新为「{STATUS_LABELS[STATUS_ORDER[currentStatusIndex + 1]]}」
            </button>
          </div>
        )}
      </div>

      <div className="mb-24">
        <h2 className="text-lg font-semibold mb-3">
          线索留言
          {postClues.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({postClues.length})
            </span>
          )}
        </h2>

        {postClues.length > 0 && (
          <div className="space-y-3 mb-4">
            {postClues.map((clue) => (
              <div key={clue.id} className="rounded-lg border p-3 text-sm">
                <p className="text-gray-800">{clue.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {clue.seenTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(clue.seenTime)}
                    </span>
                  )}
                  {clue.seenLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {clue.seenLocation}
                    </span>
                  )}
                </div>
                {clue.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {clue.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt=""
                        className="w-16 h-16 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border p-4 space-y-3">
          <textarea
            value={clueContent}
            onChange={(e) => setClueContent(e.target.value)}
            placeholder="描述你看到的线索..."
            className="w-full rounded-lg border border-gray-200 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="datetime-local"
              value={clueSeenTime}
              onChange={(e) => setClueSeenTime(e.target.value)}
              className="rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="text"
              value={clueSeenLocation}
              onChange={(e) => setClueSeenLocation(e.target.value)}
              placeholder="发现地点"
              className="rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <input
              ref={clueFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleCluePhotoUpload}
              className="hidden"
            />
            <div className="flex gap-2 items-center">
              {cluePhotos.map((photo, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img src={photo} alt="" className="w-full h-full object-cover rounded" />
                  <button
                    onClick={() => setCluePhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {cluePhotos.length < 3 && (
                <button
                  onClick={() => clueFileRef.current?.click()}
                  className="w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleAddClue}
            disabled={!clueContent.trim()}
            className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交线索
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
        <div className="max-w-3xl mx-auto px-4">
          <button
            onClick={() => setShowPoster(true)}
            className="w-full rounded-lg bg-orange-500 py-3 text-white font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            打印寻宠启事
          </button>
        </div>
      </div>

      {showPoster && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] overflow-y-auto">
            <div id="poster" className="bg-white p-8 w-[340px]">
              <div
                className="h-1 rounded-full mb-4"
                style={{ backgroundColor: TYPE_COLORS[post.type] }}
              />
              <h2 className="text-center text-xl font-bold mb-4">
                {post.type === 'lost' ? '寻宠启事' : '领养公告'}
              </h2>
              {post.photos.length > 0 && (
                <div className="flex justify-center mb-4">
                  <img
                    src={post.photos[0]}
                    alt={post.name}
                    className="rounded-lg object-cover"
                    style={{ width: 300, height: 225 }}
                  />
                </div>
              )}
              <div className="text-center mb-3">
                <span className="text-lg font-bold">{post.name}</span>
                {post.breed && <span className="text-gray-600 ml-2 text-sm">{post.breed}</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {post.furColor && <div>毛色：{post.furColor}</div>}
                {post.gender && <div>性别：{GENDER_LABELS[post.gender]}</div>}
                {post.lostTime && <div>时间：{formatDateShort(post.lostTime)}</div>}
                {post.locationDesc && <div>地点：{post.locationDesc}</div>}
              </div>
              {(post.contactName || post.contactPhone || post.contactWechat) && (
                <div className="border-t border-gray-200 pt-3 mb-3 text-sm space-y-1">
                  {post.contactName && <div>联系人：{post.contactName}</div>}
                  {post.contactPhone && <div>电话：{post.contactPhone}</div>}
                  {post.contactWechat && <div>微信：{post.contactWechat}</div>}
                </div>
              )}
              {post.reward && (
                <div className="text-orange-600 font-medium text-sm mb-3">
                  酬谢：{post.reward}
                </div>
              )}
              <div className="flex justify-end">
                <QRCodeSVG
                  value={`${window.location.origin}/post/${post.id}`}
                  size={80}
                />
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-gray-100">
              <button
                onClick={handleDownloadPoster}
                className="flex-1 rounded-lg bg-orange-500 py-2 text-white font-medium hover:bg-orange-600"
              >
                下载海报
              </button>
              <button
                onClick={() => setShowPoster(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

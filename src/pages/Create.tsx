import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePetStore } from '@/store/usePetStore'
import type { PetType, PetGender, PetPost } from '@/types'
import { TYPE_LABELS, GENDER_LABELS } from '@/types'
import { ArrowLeft, Camera, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'

function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return (
    <Marker
      position={[lat, lng]}
      draggable
      eventHandlers={{
        dragend(e) {
          const marker = e.target as L.Marker
          const pos = marker.getLatLng()
          onChange(pos.lat, pos.lng)
        },
      }}
    />
  )
}

export default function Create() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { posts, addPost, updatePost } = usePetStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingPost = id ? posts.find((p) => p.id === id) : null

  const [type, setType] = useState<PetType>(existingPost?.type ?? 'lost')
  const [name, setName] = useState(existingPost?.name ?? '')
  const [breed, setBreed] = useState(existingPost?.breed ?? '')
  const [furColor, setFurColor] = useState(existingPost?.furColor ?? '')
  const [size, setSize] = useState(existingPost?.size ?? '')
  const [description, setDescription] = useState(existingPost?.description ?? '')
  const [gender, setGender] = useState<PetGender>(existingPost?.gender ?? 'unknown')
  const [photos, setPhotos] = useState<string[]>(existingPost?.photos ?? [])
  const [lostTime, setLostTime] = useState(existingPost?.lostTime ?? '')
  const [locationDesc, setLocationDesc] = useState(existingPost?.locationDesc ?? '')
  const [lat, setLat] = useState(existingPost?.lat ?? 39.9042)
  const [lng, setLng] = useState(existingPost?.lng ?? 116.4074)
  const [contactName, setContactName] = useState(existingPost?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(existingPost?.contactPhone ?? '')
  const [contactWechat, setContactWechat] = useState(existingPost?.contactWechat ?? '')
  const [reward, setReward] = useState(existingPost?.reward ?? '')

  useEffect(() => {
    if (id && !existingPost) {
      navigate('/')
    }
  }, [id, existingPost, navigate])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = 6 - photos.length
    const toProcess = Array.from(files).slice(0, remaining)
    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => {
            if (prev.length >= 6) return prev
            return [...prev, ev.target!.result as string]
          })
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const postData: Omit<PetPost, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      status: existingPost?.status ?? 'searching',
      name,
      breed,
      furColor,
      gender,
      size,
      description,
      photos,
      lostTime: lostTime ? new Date(lostTime).toISOString() : '',
      locationDesc,
      lat,
      lng,
      contactName,
      contactPhone,
      contactWechat,
      reward,
    }

    if (id) {
      updatePost(id, postData)
      navigate(`/post/${id}`)
    } else {
      const newId = addPost(postData)
      navigate(`/post/${newId}`)
    }
  }

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-stone-600 hover:text-stone-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>

      <h1 className="text-2xl font-bold text-stone-800 mb-6 font-display">
        {id ? '编辑信息' : '发布信息'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-base font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full" />
            基本信息
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">类型</label>
              <div className="flex gap-3">
                {(['lost', 'found'] as PetType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      'flex-1 py-3 rounded-full text-center font-bold transition',
                      type === t
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >
                    {t === 'lost' ? '😿 走失' : '🐶 捡到'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">宠物名字</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="请输入宠物名字"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">品种</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className={inputClass}
                  placeholder="如：金毛、英短"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">毛色</label>
                <input
                  type="text"
                  value={furColor}
                  onChange={(e) => setFurColor(e.target.value)}
                  className={inputClass}
                  placeholder="如：金色、黑白"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">性别</label>
                <div className="flex gap-2">
                  {(['male', 'female', 'unknown'] as PetGender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        'flex-1 py-2 rounded-full text-center text-sm font-medium transition',
                        gender === g
                          ? 'bg-orange-500 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      )}
                    >
                      {GENDER_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">体型</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClass}
                  placeholder="如：大型、中型"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">详细描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(inputClass, 'min-h-[100px] resize-y')}
                placeholder="请描述宠物的特征、走失/捡到时的具体情况..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                照片（最多6张，首张为封面）
              </label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                        封面
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-orange-400 hover:text-orange-400 transition"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">添加照片</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-base font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full" />
            时间地点
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {type === 'lost' ? '走失时间' : '捡到时间'}
              </label>
              <input
                type="datetime-local"
                value={lostTime}
                onChange={(e) => setLostTime(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">地点描述</label>
              <input
                type="text"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                className={inputClass}
                placeholder="如：朝阳区望京SOHO附近"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                <MapPin className="w-4 h-4 inline-block mr-1" />
                选择位置（点击地图或拖动标记）
              </label>
              <div className="h-60 rounded-lg overflow-hidden border border-stone-300">
                <MapContainer
                  center={[lat, lng]}
                  zoom={13}
                  className="h-full w-full"
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker lat={lat} lng={lng} onChange={handleLocationChange} />
                </MapContainer>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                当前坐标：{lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-base font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full" />
            联系方式
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">联系人</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={inputClass}
                  placeholder="姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">联系电话</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={inputClass}
                  placeholder="手机号"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">微信号</label>
                <input
                  type="text"
                  value={contactWechat}
                  onChange={(e) => setContactWechat(e.target.value)}
                  className={inputClass}
                  placeholder="微信号（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">酬谢说明</label>
                <input
                  type="text"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className={inputClass}
                  placeholder="如：500元（可选）"
                />
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 transition shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {id ? '保存修改' : '🐾 发布信息'}
        </button>
      </form>
    </div>
  )
}

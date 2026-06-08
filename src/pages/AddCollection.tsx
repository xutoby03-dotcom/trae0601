import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCollectionStore } from '@/store/useCollectionStore'
import type { Rarity } from '@/types'
import { RARITY_CONFIG } from '@/types'
import { ArrowLeft, Camera, Plus } from 'lucide-react'

export default function AddCollection() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { addCollection, updateCollection, addSeries, series, collections } = useCollectionStore()

  const existingCollection = id ? collections.find((c) => c.id === id) : null

  const [seriesId, setSeriesId] = useState(existingCollection?.seriesId || '')
  const [characterName, setCharacterName] = useState(existingCollection?.characterName || '')
  const [rarity, setRarity] = useState<Rarity>(existingCollection?.rarity || 'common')
  const [purchasePrice, setPurchasePrice] = useState(existingCollection?.purchasePrice?.toString() || '')
  const [purchaseDate, setPurchaseDate] = useState(existingCollection?.purchaseDate || new Date().toISOString().split('T')[0])
  const [purchaseChannel, setPurchaseChannel] = useState(existingCollection?.purchaseChannel || '')
  const [isDuplicate, setIsDuplicate] = useState(existingCollection?.isDuplicate || false)
  const [willingToExchange, setWillingToExchange] = useState(existingCollection?.willingToExchange || false)
  const [photo, setPhoto] = useState(existingCollection?.photo || '')
  const [notes, setNotes] = useState(existingCollection?.notes || '')
  const [currentValue, setCurrentValue] = useState(existingCollection?.currentValue?.toString() || '')
  const [newSeriesName, setNewSeriesName] = useState('')
  const [newSeriesTotalItems, setNewSeriesTotalItems] = useState('')
  const [newSeriesItemNames, setNewSeriesItemNames] = useState('')
  const [showNewSeries, setShowNewSeries] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCreateSeries = () => {
    if (!newSeriesName.trim()) return
    const parsedItems = newSeriesItemNames
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const newId = addSeries({
      name: newSeriesName.trim(),
      description: '',
      totalItems: parseInt(newSeriesTotalItems) || parsedItems.length || 1,
      itemNames: parsedItems,
      coverImage: '',
    })
    setSeriesId(newId)
    setNewSeriesName('')
    setNewSeriesTotalItems('')
    setNewSeriesItemNames('')
    setShowNewSeries(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      seriesId,
      characterName: characterName.trim(),
      rarity,
      purchasePrice: parseFloat(purchasePrice) || 0,
      purchaseDate,
      purchaseChannel: purchaseChannel.trim(),
      isDuplicate,
      willingToExchange,
      photo,
      notes: notes.trim(),
      currentValue: parseFloat(currentValue) || 0,
    }

    if (id && existingCollection) {
      updateCollection(id, data)
    } else {
      addCollection(data)
    }
    navigate('/')
  }

  const rarities: { key: Rarity; icon: React.ReactNode }[] = [
    { key: 'common', icon: null },
    { key: 'rare', icon: <span className="text-blue-400">★</span> },
    { key: 'hidden', icon: <span className="text-yellow-400">✦</span> },
  ]

  return (
    <div className="min-h-screen bg-cabinet-bg container mx-auto px-4 py-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-amber-primary/10 transition-colors">
          <ArrowLeft size={22} className="text-amber-primary" />
        </button>
        <h1 className="text-xl font-extrabold text-amber-light">
          {id ? '编辑盲盒' : '添加盲盒'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <div className="cabinet-shelf rounded-xl px-4 py-3 mb-3">
            <h2 className="font-extrabold text-amber-light">基本信息</h2>
          </div>
          <div className="card-collectible rounded-2xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">系列</label>
              {showNewSeries ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    placeholder="新系列名称"
                    className="input-field w-full"
                  />
                  <input
                    type="number"
                    value={newSeriesTotalItems}
                    onChange={(e) => setNewSeriesTotalItems(e.target.value)}
                    placeholder="总款式数（选填，留空自动根据款名计算）"
                    min="1"
                    className="input-field w-full"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">款名清单</label>
                    <textarea
                      value={newSeriesItemNames}
                      onChange={(e) => setNewSeriesItemNames(e.target.value)}
                      placeholder="输入角色名，用逗号或换行分隔&#10;如：小熊, 小兔, 小猫"
                      rows={3}
                      className="input-field w-full resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCreateSeries} className="btn-primary text-sm py-2 px-4">
                      创建
                    </button>
                    <button type="button" onClick={() => setShowNewSeries(false)} className="btn-secondary text-sm py-2 px-4">
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={seriesId}
                    onChange={(e) => setSeriesId(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">选择系列</option>
                    {series.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewSeries(true)}
                    className="btn-secondary py-2 px-3 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    新建
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">角色名称</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="输入角色名称"
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">稀有度</label>
              <div className="flex gap-2">
                {rarities.map(({ key, icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRarity(key)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                      rarity === key
                        ? `badge-rarity-${key} ring-2 ring-offset-1 ring-offset-transparent`
                        : 'bg-white/5 text-amber-light/40 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {icon}
                    {RARITY_CONFIG[key].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="cabinet-shelf rounded-xl px-4 py-3 mb-3">
            <h2 className="font-extrabold text-amber-light">入手信息</h2>
          </div>
          <div className="card-collectible rounded-2xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">入手价格</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-primary/50 font-bold">¥</span>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="input-field w-full pl-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">入手日期</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">入手渠道</label>
              <input
                type="text"
                value={purchaseChannel}
                onChange={(e) => setPurchaseChannel(e.target.value)}
                placeholder="如：泡泡玛特线下店 / 天猫旗舰店"
                className="input-field w-full"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="cabinet-shelf rounded-xl px-4 py-3 mb-3">
            <h2 className="font-extrabold text-amber-light">交换信息</h2>
          </div>
          <div className="card-collectible rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-light text-sm">是否重复款</p>
                <p className="text-xs text-amber-light/40">标记已拥有的重复款式</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDuplicate(!isDuplicate)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  isDuplicate ? 'bg-amber-primary' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isDuplicate ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-light text-sm">愿意交换</p>
                <p className="text-xs text-amber-light/40">开放与其他玩家交换</p>
              </div>
              <button
                type="button"
                onClick={() => setWillingToExchange(!willingToExchange)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  willingToExchange ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    willingToExchange ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">当前估值</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-primary/50 font-bold">¥</span>
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="input-field w-full pl-7"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="cabinet-shelf rounded-xl px-4 py-3 mb-3">
            <h2 className="font-extrabold text-amber-light">附加信息</h2>
          </div>
          <div className="card-collectible rounded-2xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">照片</label>
              {photo ? (
                <div className="relative group">
                  <img
                    src={photo}
                    alt="预览"
                    className="w-full h-48 object-cover rounded-xl border border-amber-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-amber-primary/20 cursor-pointer hover:border-amber-primary/40 hover:bg-amber-primary/5 transition-all">
                  <Camera size={28} className="text-amber-primary/30 mb-2" />
                  <span className="text-sm text-amber-light/40">点击上传照片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-primary/70 mb-1.5">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录一些特别的信息..."
                rows={3}
                className="input-field w-full resize-none"
              />
            </div>
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1 py-3 text-base">
            {id ? '保存修改' : '添加收藏'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary flex-1 py-3 text-base">
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

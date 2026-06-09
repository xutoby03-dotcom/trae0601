import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBakingStore, generateId } from '@/store/bakingStore'
import type { ProductType, BakingResult, BakingRecord } from '@/types'
import { PRODUCT_TYPE_LABELS, RESULT_LABELS, FLOUR_TYPES } from '@/types'
import { ArrowLeft, Camera, Star, Save, X, Upload } from 'lucide-react'

export default function RecordForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { addRecord, updateRecord, getRecord } = useBakingStore()

  const existingRecord = id ? getRecord(id) : undefined

  const [productName, setProductName] = useState(existingRecord?.productName ?? '')
  const [productType, setProductType] = useState<ProductType>(existingRecord?.productType ?? 'cake')
  const [date, setDate] = useState(existingRecord?.date ?? new Date().toISOString().split('T')[0])
  const [ovenTemp, setOvenTemp] = useState(existingRecord?.ovenTemp ?? 0)
  const [bakeTime, setBakeTime] = useState(existingRecord?.bakeTime ?? 0)
  const [flourType, setFlourType] = useState(existingRecord?.flourType ?? FLOUR_TYPES[0])
  const [humidity, setHumidity] = useState(existingRecord?.humidity ?? 0)
  const [materialCost, setMaterialCost] = useState(existingRecord?.materialCost ?? 0)
  const [photos, setPhotos] = useState<string[]>(existingRecord?.photos ?? [])
  const [result, setResult] = useState<BakingResult>(existingRecord?.result ?? 'success')
  const [tasteScore, setTasteScore] = useState(existingRecord?.tasteScore ?? 0)
  const [notes, setNotes] = useState(existingRecord?.notes ?? '')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPhotos((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
        e.target.value = ''
      }
    },
    [handleFiles]
  )

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = () => {
    if (existingRecord) {
      updateRecord(existingRecord.id, {
        productName,
        productType,
        date,
        ovenTemp,
        bakeTime,
        flourType,
        humidity,
        materialCost,
        photos,
        result,
        tasteScore,
        notes,
      })
      if (result === 'failure' || result === 'partial') {
        navigate(`/record/${existingRecord.id}/analysis`)
      } else {
        navigate('/')
      }
      return
    }

    const newId = generateId()
    const record: BakingRecord = {
      id: newId,
      productName,
      productType,
      date,
      ovenTemp,
      bakeTime,
      flourType,
      humidity,
      materialCost,
      photos,
      result,
      tasteScore,
      notes,
      problemTags: [],
      status: result === 'failure' || result === 'partial' ? 'pending_review' : 'improved',
      versionLabel: 'v1',
      versionNumber: 1,
      parentId: null,
      productId: generateId(),
      createdAt: new Date().toISOString(),
      adjustments: [],
    }
    addRecord(record)

    if (result === 'failure' || result === 'partial') {
      navigate(`/record/${newId}/analysis`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-bake-cream font-body">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-bake bg-bake-card text-bake-brown shadow-sm transition hover:bg-bake-warm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl font-bold text-bake-dark">
            {existingRecord ? '编辑烘焙记录' : '新建烘焙记录'}
          </h1>
        </div>

        {/* Basic Info */}
        <section className="mb-5 rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-bake-brown">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-bake-dark">产品名称</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="例如：戚风蛋糕"
                className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-bake-dark">产品类型</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
              >
                {(Object.entries(PRODUCT_TYPE_LABELS) as [ProductType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-bake-dark">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
              />
            </div>
          </div>
        </section>

        {/* Recipe Details */}
        <section className="mb-5 rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-bake-brown">配方详情</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-bake-dark">烤箱温度 (℃)</label>
                <input
                  type="number"
                  value={ovenTemp || ''}
                  onChange={(e) => setOvenTemp(Number(e.target.value))}
                  placeholder="180"
                  className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-bake-dark">烘烤时间 (分钟)</label>
                <input
                  type="number"
                  value={bakeTime || ''}
                  onChange={(e) => setBakeTime(Number(e.target.value))}
                  placeholder="30"
                  className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-bake-dark">面粉类型</label>
              <select
                value={flourType}
                onChange={(e) => setFlourType(e.target.value)}
                className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
              >
                {FLOUR_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-bake-dark">湿度 (%)</label>
                <input
                  type="number"
                  value={humidity || ''}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  placeholder="60"
                  className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-bake-dark">材料成本 (元)</label>
                <input
                  type="number"
                  step="0.01"
                  value={materialCost || ''}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  placeholder="25.00"
                  className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Photo Upload */}
        <section className="mb-5 rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-bake-brown">照片上传</h2>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-bake border-2 border-dashed py-10 transition ${
              dragOver
                ? 'border-bake-caramel bg-bake-warm'
                : 'border-bake-border bg-bake-light hover:border-bake-caramel hover:bg-bake-warm'
            }`}
          >
            <Upload size={32} className="mb-2 text-bake-caramel" />
            <p className="text-sm text-bake-brown">拖拽照片到此处或点击上传</p>
            <p className="mt-1 text-xs text-bake-caramel">支持多张图片</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          {photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`照片 ${index + 1}`}
                    className="h-20 w-20 rounded-bake border border-bake-border object-cover"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-bake-red text-white shadow-sm transition hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Result Evaluation */}
        <section className="mb-5 rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-bake-brown">结果评估</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-bake-dark">烘焙结果</label>
              <div className="flex gap-4">
                {(
                  Object.entries(RESULT_LABELS) as [BakingResult, string][]
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-2 rounded-bake border px-4 py-2 transition ${
                      result === value
                        ? 'border-bake-caramel bg-bake-warm text-bake-brown'
                        : 'border-bake-border bg-bake-light text-bake-dark'
                    }`}
                  >
                    <input
                      type="radio"
                      name="result"
                      value={value}
                      checked={result === value}
                      onChange={() => setResult(value)}
                      className="accent-bake-caramel"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-bake-dark">口味评分</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setTasteScore(star)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={
                        star <= tasteScore
                          ? 'fill-bake-caramel text-bake-caramel'
                          : 'text-bake-border'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-bake-dark">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录烘焙过程中的观察和心得..."
                rows={4}
                className="w-full resize-none rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-bake-dark outline-none transition focus:border-bake-caramel"
              />
            </div>
          </div>
        </section>

        <button
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-bake bg-bake-brown py-3 text-base font-semibold text-white shadow-md transition hover:bg-bake-dark"
        >
          <Save size={18} />
          保存记录
        </button>
      </div>
    </div>
  )
}

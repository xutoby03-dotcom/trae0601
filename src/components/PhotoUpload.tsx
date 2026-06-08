import { useRef, useState } from 'react'
import { Camera, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
  max?: number
}

export default function PhotoUpload({ photos, onChange, max = 3 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remaining = max - photos.length
    const filesToProcess = Array.from(files).slice(0, remaining)

    setLoading(true)
    let processed = 0
    const newPhotos: string[] = []

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        newPhotos.push(result)
        processed++
        if (processed === filesToProcess.length) {
          onChange([...photos, ...newPhotos])
          setLoading(false)
        }
      }
      reader.readAsDataURL(file)
    })

    if (filesToProcess.length === 0) {
      setLoading(false)
    }

    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {photos.map((photo, i) => (
          <div key={i} className="relative group">
            <img
              src={photo}
              alt={`照片 ${i + 1}`}
              className="w-24 h-24 rounded-xl object-cover border-2 border-earth-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-tomato-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className={cn(
              'w-24 h-24 rounded-xl border-2 border-dashed border-earth-300',
              'flex flex-col items-center justify-center gap-1',
              'text-earth-400 hover:text-leaf-500 hover:border-leaf-400',
              'transition-colors duration-200',
              loading && 'opacity-50 cursor-wait'
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-earth-300 border-t-leaf-500 rounded-full animate-spin" />
            ) : (
              <>
                <Camera size={20} />
                <span className="text-[10px] font-serif">添加照片</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {photos.length === 0 && (
        <p className="text-xs font-serif text-earth-400 mt-2 flex items-center gap-1">
          <ImageIcon size={12} />
          上传对比照片，记录成长变化
        </p>
      )}
    </div>
  )
}

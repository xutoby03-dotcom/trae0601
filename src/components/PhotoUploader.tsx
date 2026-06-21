import { useRef } from "react"
import { Camera, X } from "lucide-react"

interface PhotoUploaderProps {
  photos: string[]
  onChange: (photos: string[]) => void
  maxPhotos?: number
}

export default function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 3,
}: PhotoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (photos.length >= maxPhotos) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        if (result) {
          onChange([...photos, result].slice(0, maxPhotos))
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileRef.current) fileRef.current.value = ""
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm font-semibold text-[#fafafa]">
          观察照片
        </h3>
        <span className="text-xs text-[#6b8f9e]">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      <div className="flex gap-3">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="group relative h-24 w-24 overflow-hidden rounded-xl border border-white/[0.06] bg-[#16162a]"
          >
            <img
              src={photo}
              alt={`观察照片 ${idx + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              onClick={() => removePhoto(idx)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#3a3a55] bg-[#16162a]/50 text-[#6b8f9e] transition-all hover:border-[#e8a838]/40 hover:text-[#e8a838]"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">上传</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

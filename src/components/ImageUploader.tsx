import { X, ImagePlus } from 'lucide-react'
import { fileToBase64, THEME_COLORS } from '@/lib/utils'
import { useCallback } from 'react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: Props) {
  const handleAdd = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return
      const newImages: string[] = [...images]
      for (let i = 0; i < files.length && newImages.length < 9; i++) {
        const base64 = await fileToBase64(files[i])
        newImages.push(base64)
      }
      onChange(newImages)
    }
    input.click()
  }, [images, onChange])

  const handleRemove = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index))
    },
    [images, onChange]
  )

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((img, i) => (
        <div
          key={i}
          className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[#D4A574]/20"
          style={{ background: THEME_COLORS.paperTexture }}
        >
          <img src={img} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      {images.length < 9 && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#D4A574]/30 transition-colors hover:border-[#D4A574]/60 hover:bg-[#D4A574]/5"
          style={{ color: THEME_COLORS.gold }}
        >
          <ImagePlus size={20} strokeWidth={1.5} />
          <span className="text-[10px]">添加图片</span>
        </button>
      )}
    </div>
  )
}

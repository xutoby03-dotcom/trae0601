import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  value?: string
  onChange: (value: string) => void
  label?: string
}

export default function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      onChange(base64)
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          minHeight: '160px',
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          backgroundColor: 'var(--bg-card)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.03)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.backgroundColor = 'var(--bg-card)'
        }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="预览"
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <button
              onClick={handleDelete}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
              }}
            >
              <X size={16} />
            </button>
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                padding: '2px 10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                fontSize: '12px',
                borderRadius: '999px',
              }}
            >
              点击替换
            </span>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '24px',
              color: 'var(--text-secondary)',
            }}
          >
            <Upload
              size={36}
              style={{
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              点击上传
            </span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

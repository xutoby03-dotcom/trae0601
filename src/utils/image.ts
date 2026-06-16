interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  type?: string
}

interface ImageSize {
  width: number
  height: number
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function base64ToFile(base64: string, filename: string, type: string = 'image/png'): File {
  const arr = base64.split(',')
  const bstr = atob(arr[arr.length - 1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type })
}

export function base64ToBlob(base64: string, type: string = 'image/png'): Blob {
  const arr = base64.split(',')
  const bstr = atob(arr[arr.length - 1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type })
}

export function getImageSize(file: File | string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    
    img.onerror = reject
    
    if (typeof file === 'string') {
      img.src = file
    } else {
      img.src = URL.createObjectURL(file)
    }
  })
}

export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    type = 'image/jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    const img = new Image()
    
    img.onload = () => {
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Compression failed'))
          }
        },
        type,
        quality
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export async function compressImageToBase64(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const blob = await compressImage(file, options)
  return fileToBase64(new File([blob], file.name, { type: blob.type }))
}

export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

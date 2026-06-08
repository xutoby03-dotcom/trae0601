import { useEffect, useState } from 'react'
import { useCineQuoteStore } from '@/store'

export function useImageUrl(imageId: string | null) {
  const getImageUrl = useCineQuoteStore((s) => s.getImageUrl)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageId) {
      setUrl(null)
      return
    }
    let revoked = false
    getImageUrl(imageId).then((u) => {
      if (!revoked) setUrl(u)
    })
    return () => {
      revoked = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [imageId, getImageUrl])

  return url
}

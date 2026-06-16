import { useState } from 'react';
import { Leaf, ImageOff } from 'lucide-react';

interface PlantPhotoProps {
  photoUrl?: string;
  alt: string;
  aspect?: '4/3' | 'banner' | 'square';
  showHoverZoom?: boolean;
}

export default function PlantPhoto({
  photoUrl,
  alt,
  aspect = '4/3',
  showHoverZoom = false,
}: PlantPhotoProps) {
  const [loadError, setLoadError] = useState(false);

  const aspectClass = {
    '4/3': 'aspect-[4/3]',
    'banner': 'h-56 md:h-72',
    'square': 'aspect-square',
  }[aspect];

  if (photoUrl && !loadError) {
    return (
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-forest-100`}>
        <img
          src={photoUrl}
          alt={alt}
          className={`w-full h-full object-cover ${
            showHoverZoom ? 'group-hover:scale-105 transition-transform duration-500' : ''
          }`}
          onError={() => setLoadError(true)}
        />
      </div>
    );
  }

  if (photoUrl && loadError) {
    return (
      <div
        className={`relative w-full ${aspectClass} overflow-hidden bg-gradient-to-br from-cream-100 to-cream-200 flex flex-col items-center justify-center`}
      >
        <ImageOff className="w-12 h-12 text-clay-400 mb-2" />
        <p className="text-sm text-clay-600 font-medium">图片加载失败</p>
        <p className="text-xs text-clay-500 mt-1">请检查照片地址是否有效</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center`}
    >
      <Leaf className="w-16 h-16 text-forest-300" />
    </div>
  );
}

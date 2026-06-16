import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxCount?: number;
}

const clothingPrompts = [
  'fashion clothing sample on mannequin, studio lighting, professional product photography',
  'elegant dress sample on hanger, white background, high resolution',
  'casual wear shirt sample laid flat, top view, studio shot',
  'tailored suit jacket sample, detail shot, fabric texture visible',
  'knitwear sweater sample, soft lighting, neutral background',
];

function generateRandomPhotoUrl(): string {
  const prompt = clothingPrompts[Math.floor(Math.random() * clothingPrompts.length)];
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square`;
}

export default function PhotoUploader({
  photos,
  onChange,
  maxCount = 5,
}: PhotoUploaderProps) {
  const handleAdd = () => {
    if (photos.length >= maxCount) return;
    const newPhoto = generateRandomPhotoUrl();
    onChange([...photos, newPhoto]);
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const canAdd = photos.length < maxCount;

  return (
    <div className="flex flex-wrap gap-3">
      {photos.map((photo, index) => (
        <div
          key={index}
          className="group relative h-24 w-24 overflow-hidden rounded-lg border border-cream-200 bg-white"
        >
          <img
            src={photo}
            alt={`照片 ${index + 1}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'flex h-full w-full items-center justify-center bg-cream-50';
                fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-charcoal-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                parent.appendChild(fallback);
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className={cn(
              'absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full',
              'bg-charcoal-700/80 text-white opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100 hover:bg-charcoal-800'
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-cream-300 bg-cream-50 text-charcoal-400 transition-all duration-200 hover:border-charcoal-300 hover:bg-white hover:text-charcoal-600"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">上传照片</span>
          <span className="text-[10px] text-charcoal-300">
            {photos.length}/{maxCount}
          </span>
        </button>
      )}
    </div>
  );
}

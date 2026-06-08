import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { ICON_GRID } from "@/data/foodIcons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  onPhotoChange?: (photo: string) => void;
}

export default function IconPicker({ value, onChange, onPhotoChange }: IconPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoPreview(result);
      onPhotoChange?.(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-5xl">
          {value}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-8 gap-2">
        {ICON_GRID.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-all duration-150 hover:bg-gray-50",
              value === icon && "ring-2 ring-[#4ECDC4] bg-[#4ECDC4]/10"
            )}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
        >
          <Camera className="h-4 w-4" />
          拍照
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        {photoPreview && (
          <img
            src={photoPreview}
            alt="预览"
            className="h-12 w-12 rounded-xl object-cover ring-2 ring-[#4ECDC4]"
          />
        )}
      </div>
    </div>
  );
}

import { getCategory } from "@/data/constants";
import type { EquipmentCategory } from "@/types";

interface Props {
  photo?: string;
  category: EquipmentCategory;
  className?: string;
}

export default function EquipmentPhoto({ photo, category, className = "" }: Props) {
  const cat = getCategory(category);

  if (photo) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={photo}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${cat.bgColor} ${className}`}
    >
      <span className="text-4xl md:text-5xl drop-shadow-sm">{cat.emoji}</span>
    </div>
  );
}

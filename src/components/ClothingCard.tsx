import { useState } from "react";
import { X, ThermometerSun, User, AlertTriangle } from "lucide-react";
import type { Clothing } from "@/types";
import {
  MATERIAL_LABELS,
  COLOR_CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  CATEGORY_LABELS,
} from "@/types";
import { useStore } from "@/store/useStore";

interface ClothingCardProps {
  clothing: Clothing;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  showRemove?: boolean;
  onRemove?: (id: string) => void;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  compact?: boolean;
}

export default function ClothingCard({
  clothing,
  draggable = false,
  onDragStart,
  showRemove = false,
  onRemove,
  onClick,
  selectable = false,
  selected = false,
  highlighted = false,
  compact = false,
}: ClothingCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const member = useStore((s) =>
    s.members.find((m) => m.id === clothing.memberId)
  );

  const borderColor =
    clothing.colorCategory === "light"
      ? "border-neutral-200"
      : clothing.colorCategory === "dark"
      ? "border-neutral-800"
      : "border-neutral-400";

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, clothing.id)}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 ${
        compact ? "p-2" : "p-3"
      } ${
        selectable
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-elevated"
          : ""
      } ${
        selected
          ? "ring-2 ring-primary-500 ring-offset-2"
          : highlighted
          ? "ring-2 ring-accent-danger ring-offset-2 animate-pulse-slow"
          : ""
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(clothing.id);
          }}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-500 opacity-0 shadow-soft backdrop-blur transition-all hover:bg-accent-danger hover:text-white group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div
        className={`relative overflow-hidden rounded-xl bg-neutral-100 ${
          compact ? "h-16" : "h-32"
        }`}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
            <span className="text-3xl">{CATEGORY_EMOJIS[clothing.category]}</span>
          </div>
        )}
        <img
          src={clothing.photoUrl}
          alt={clothing.name}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${borderColor} bg-white shadow-soft`}
          title={COLOR_CATEGORY_LABELS[clothing.colorCategory]}
        />
        {clothing.colorfast && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-accent-danger/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-soft">
            <AlertTriangle className="h-3 w-3" />
            易掉色
          </div>
        )}
      </div>

      <div className={`mt-2 ${compact ? "space-y-0.5" : "space-y-1"}`}>
        <div
          className={`font-medium text-neutral-800 ${
            compact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
          }`}
        >
          {clothing.name}
        </div>

        {!compact && (
          <>
            <div className="flex flex-wrap gap-1">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                {CATEGORY_EMOJIS[clothing.category]} {CATEGORY_LABELS[clothing.category]}
              </span>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                {MATERIAL_LABELS[clothing.material]}
              </span>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                {COLOR_CATEGORY_LABELS[clothing.colorCategory]}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <ThermometerSun className="h-3 w-3" />
                {clothing.suggestedTemp}°C
              </span>
              {member && (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {member.avatar} {member.name}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

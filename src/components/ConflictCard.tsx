import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Conflict, Clothing } from "@/types";
import { CONFLICT_TYPE_LABELS, CONFLICT_TYPE_COLORS } from "@/types";

interface ConflictCardProps {
  conflict: Conflict;
  clothing1?: Clothing;
  clothing2?: Clothing;
}

export default function ConflictCard({
  conflict,
  clothing1,
  clothing2,
}: ConflictCardProps) {
  const color = CONFLICT_TYPE_COLORS[conflict.type];

  return (
    <div
      className="animate-fade-in rounded-2xl border-2 bg-white p-3 shadow-card"
      style={{ borderColor: color, animationDelay: "0.05s" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-white animate-pulse-slow"
          style={{ backgroundColor: color }}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <span
          className="text-xs font-bold"
          style={{ color }}
        >
          {CONFLICT_TYPE_LABELS[conflict.type]}
        </span>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <div className="flex-1 truncate rounded-lg bg-neutral-50 px-2 py-1.5 text-xs font-medium text-neutral-700">
          {clothing1?.name || "衣物1"}
        </div>
        <ArrowRight
          className="h-4 w-4 flex-shrink-0"
          style={{ color }}
        />
        <div className="flex-1 truncate rounded-lg bg-neutral-50 px-2 py-1.5 text-xs font-medium text-neutral-700">
          {clothing2?.name || "衣物2"}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-neutral-600">
        {conflict.description}
      </p>
    </div>
  );
}

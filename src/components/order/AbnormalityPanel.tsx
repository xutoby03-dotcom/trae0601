import { useState } from "react";
import {
  AlertTriangle,
  Plus,
  CheckCircle,
  Phone,
  X,
} from "lucide-react";
import {
  Order,
  Abnormality,
  AbnormalityType,
  ABNORMALITY_META,
} from "@/types";
import { formatDateTime } from "@/utils/time";
import { usePetStore } from "@/store/usePetStore";

interface AbnormalityPanelProps {
  order: Order;
}

const abnormalityOptions: AbnormalityType[] = [
  "skin_redness",
  "severe_matting",
  "nail_bleeding",
];

export default function AbnormalityPanel({ order }: AbnormalityPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<AbnormalityType | null>(null);
  const [description, setDescription] = useState("");
  const { addAbnormality, notifyOwner } = usePetStore();

  const handleSubmit = () => {
    if (!selectedType || !description.trim()) return;
    addAbnormality(order.id, selectedType, description);
    setIsAdding(false);
    setSelectedType(null);
    setDescription("");
  };

  const typeColorClass = (type: AbnormalityType) => {
    const meta = ABNORMALITY_META[type];
    if (meta.color === "danger") {
      return "bg-danger-500/15 text-danger-600 border-danger-500/30";
    }
    return "bg-amber-500/15 text-amber-600 border-amber-500/30";
  };

  return (
    <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
          <h3 className="font-display font-bold text-brown-900 text-lg">
            异常记录
          </h3>
          {order.abnormalities.length > 0 && (
            <span className="chip bg-danger-500/15 text-danger-600 border-danger-500/30">
              {order.abnormalities.length} 项
            </span>
          )}
        </div>
        {!isAdding && order.status !== "completed" && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-secondary text-sm py-2 px-3"
          >
            <Plus className="w-4 h-4" />
            标记异常
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-5 p-4 bg-danger-500/5 rounded-2xl border border-danger-500/20 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-brown-900 text-sm">
              新增异常记录
            </span>
            <button
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg hover:bg-white/50 text-brown-700/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {abnormalityOptions.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`chip border-2 px-4 py-2 transition-all ${
                  selectedType === type
                    ? typeColorClass(type)
                    : "bg-white border-cream-200 text-brown-700/70 hover:border-brown-700/30"
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                {ABNORMALITY_META[type].name}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述异常情况..."
            className="input-field resize-none h-24 mb-3"
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAdding(false)}
              className="btn-ghost text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedType || !description.trim()}
              className="btn-danger text-sm"
            >
              确认记录
            </button>
          </div>
        </div>
      )}

      {order.abnormalities.length === 0 && !isAdding && (
        <div className="py-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success-500/30" />
          <p className="text-brown-700/50 text-sm">暂无异常记录，一切顺利 🐾</p>
        </div>
      )}

      <div className="space-y-3">
        {order.abnormalities.map((ab: Abnormality, idx) => {
          const meta = ABNORMALITY_META[ab.type];
          return (
            <div
              key={ab.id}
              className="p-4 rounded-2xl border border-cream-200 bg-white animate-fade-in-up"
              style={{ animationDelay: `${300 + idx * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`chip ${typeColorClass(ab.type)}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {meta.name}
                </span>
                <span className="text-xs text-brown-700/50">
                  {formatDateTime(ab.createdAt)}
                </span>
              </div>
              <p className="text-sm text-brown-800 mb-3">{ab.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {ab.notifiedOwner ? (
                    <span className="chip bg-success-400/20 text-success-600 text-[10px]">
                      <CheckCircle className="w-3 h-3" />
                      已通知主人
                    </span>
                  ) : (
                    <span className="chip bg-amber-500/15 text-amber-600 text-[10px]">
                      <AlertTriangle className="w-3 h-3" />
                      待通知
                    </span>
                  )}
                </div>
                {!ab.notifiedOwner && (
                  <button
                    onClick={() => notifyOwner(order.id, ab.id)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    通知主人
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

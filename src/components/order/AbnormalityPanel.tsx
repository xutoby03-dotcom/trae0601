import { useState } from "react";
import {
  AlertTriangle,
  Plus,
  CheckCircle,
  Phone,
  X,
  Camera,
  Link,
  Image,
  MessageCircle,
  Send,
  Scissors,
  Clock,
  PawPrint,
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

const abnormalitySamplePhotos: Record<AbnormalityType, string[]> = {
  skin_redness: [
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
  ],
  severe_matting: [
    "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
  ],
  nail_bleeding: [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
  ],
};

const STORE_NAME = "萌宠美美容";
const STORE_PHONE = "400-888-9999";
const STORE_AVATAR =
  "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=200&h=200&fit=crop";

export default function AbnormalityPanel({ order }: AbnormalityPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<AbnormalityType | null>(null);
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const { addAbnormality, notifyOwner } = usePetStore();

  const handleSubmit = () => {
    if (!selectedType || !description.trim()) return;
    addAbnormality(order.id, selectedType, description, photoUrl || undefined);
    setIsAdding(false);
    setSelectedType(null);
    setDescription("");
    setPhotoUrl("");
  };

  const handleSendNotification = (abId: string) => {
    notifyOwner(order.id, abId);
  };

  const typeColorClass = (type: AbnormalityType) => {
    const meta = ABNORMALITY_META[type];
    if (meta.color === "danger") {
      return "bg-danger-500/15 text-danger-600 border-danger-500/30";
    }
    return "bg-amber-500/15 text-amber-600 border-amber-500/30";
  };

  const samplePhotos = selectedType
    ? abnormalitySamplePhotos[selectedType]
    : [];

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

          <div className="flex flex-wrap gap-2 mb-4">
            {abnormalityOptions.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setPhotoUrl("");
                }}
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

          {selectedType && (
            <div className="space-y-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="label-text mb-0 flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    现场照片
                  </p>
                  {photoUrl && (
                    <button
                      onClick={() => setPhotoUrl("")}
                      className="text-xs text-brown-700/50 hover:text-danger-500 inline-flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      清除
                    </button>
                  )}
                </div>

                {photoUrl && (
                  <div className="mb-3 w-48 h-36 rounded-xl overflow-hidden ring-2 ring-danger-200">
                    <img
                      src={photoUrl}
                      alt="预览"
                      className="w-full h-full object-cover"
                      onError={() => setPhotoUrl("")}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="w-3.5 h-3.5 text-brown-700/50" />
                    <span className="text-xs text-brown-700/60">图片链接</span>
                  </div>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="粘贴现场照片URL..."
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-3.5 h-3.5 text-brown-700/50" />
                    <span className="text-xs text-brown-700/60">或选择示例图</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {samplePhotos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPhotoUrl(url)}
                        className={`aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                          photoUrl === url
                            ? "ring-2 ring-danger-500 ring-offset-2"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`示例${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述异常情况..."
            className="input-field resize-none h-24 mb-3"
          />

          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="btn-ghost text-sm">
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedType || !description.trim()}
              className="btn-danger text-sm"
            >
              <Camera className="w-4 h-4" />
              确认记录{photoUrl && "（含照片）"}
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

      <div className="space-y-4">
        {order.abnormalities.map((ab: Abnormality, idx) => {
          const meta = ABNORMALITY_META[ab.type];
          const isExpanded = expandedPreview === ab.id;

          return (
            <div
              key={ab.id}
              className="rounded-2xl border border-cream-200 bg-white overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${300 + idx * 80}ms` }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`chip ${typeColorClass(ab.type)}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {meta.name}
                    </span>
                    {ab.photoUrl && (
                      <span className="chip bg-primary-50 text-primary-600 border-primary-100 border text-[10px]">
                        <Image className="w-3 h-3" />
                        有照片
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-brown-700/50">
                    {formatDateTime(ab.createdAt)}
                  </span>
                </div>

                {ab.photoUrl && (
                  <div className="mb-3">
                    <div className="w-full h-40 rounded-xl overflow-hidden">
                      <img
                        src={ab.photoUrl}
                        alt="异常照片"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <p className="text-sm text-brown-800 mb-3">{ab.description}</p>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ab.photoUrl && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                        <img
                          src={ab.photoUrl}
                          alt="缩略图"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
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

                  {!ab.notifiedOwner ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedPreview(isExpanded ? null : ab.id)
                        }
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {isExpanded ? "收起预览" : "预览通知"}
                      </button>
                      <button
                        onClick={() => {
                          setExpandedPreview(ab.id);
                          setTimeout(() => handleSendNotification(ab.id), 100);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <Send className="w-3.5 h-3.5" />
                        通知主人
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setExpandedPreview(isExpanded ? null : ab.id)
                      }
                      className="btn-ghost text-xs py-1.5 px-3"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {isExpanded ? "收起" : "查看已发送"}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-cream-200 bg-cream-50/50 p-4 animate-fade-in-up">
                  <div
                    className={`rounded-2xl border-2 p-4 max-w-sm mx-auto transition-all ${
                      ab.notifiedOwner
                        ? "bg-green-50/50 border-success-400/30"
                        : "bg-white border-primary-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow">
                          <img
                            src={STORE_AVATAR}
                            alt={STORE_NAME}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-brown-900 text-sm">
                            {STORE_NAME}
                          </span>
                          <span className="text-[10px] text-brown-700/40">
                            刚刚
                          </span>
                        </div>
                        <div className="text-xs text-brown-700/60 mb-2">
                          服务通知 · 异常提醒
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-cream-200 shadow-sm">
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-cream-100">
                              {ab.photoUrl ? (
                                <img
                                  src={ab.photoUrl}
                                  alt={meta.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <PawPrint className="w-5 h-5 text-brown-700/30" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="font-semibold text-sm text-brown-900">
                                  {order.pet.name}
                                </span>
                                <span
                                  className={`chip !px-1.5 !py-0.5 text-[9px] ${typeColorClass(
                                    ab.type
                                  )}`}
                                >
                                  {meta.name}
                                </span>
                              </div>
                              <p className="text-xs text-brown-700/70 leading-relaxed">
                                {ab.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-cream-100">
                            <div className="flex items-center gap-1.5 text-[10px] text-brown-700/50">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(ab.createdAt)}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-primary-600">
                              <Scissors className="w-3 h-3" />
                              {order.package.name}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] text-brown-700/50">
                            <Phone className="w-3 h-3" />
                            {STORE_PHONE}
                          </div>
                          {ab.notifiedOwner ? (
                            <span className="chip bg-success-500/15 text-success-600 border-success-500/20 border text-[10px]">
                              <CheckCircle className="w-3 h-3" />
                              已发送
                            </span>
                          ) : (
                            <span className="chip bg-primary-50 text-primary-600 border-primary-100 border text-[10px]">
                              <MessageCircle className="w-3 h-3" />
                              待发送
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-dashed border-cream-200 mt-3">
                      <Phone className="w-3.5 h-3.5 text-brown-700/40" />
                      <span className="text-[11px] text-brown-700/50">
                        将以上内容发送至 {order.ownerPhone}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

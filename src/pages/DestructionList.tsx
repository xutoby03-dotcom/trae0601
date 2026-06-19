import { useEffect, useState } from "react";
import {
  Trash2,
  Clock,
  Refrigerator,
  Box,
  User,
  Camera,
  Check,
  AlertTriangle,
} from "lucide-react";
import { destructionApi } from "@/services/api";
import type { Sample } from "../../shared/types";
import { formatDateTime, getTimeRemaining } from "@/utils/date";
import { useAppStore } from "@/store/app";
import ImageUpload from "@/components/ImageUpload";

export default function DestructionList() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [destructionPhoto, setDestructionPhoto] = useState("");
  const [destructionPerson, setDestructionPerson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useAppStore();

  const load = async () => {
    setLoading(true);
    try {
      const data = await destructionApi.getPending();
      setSamples(data);
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openConfirm = (id: string) => {
    setConfirmingId(id);
    setDestructionPhoto("");
    setDestructionPerson("");
  };

  const closeConfirm = () => {
    setConfirmingId(null);
    setDestructionPhoto("");
    setDestructionPerson("");
  };

  const handleConfirm = async () => {
    if (!destructionPhoto) {
      addToast("error", "请上传销毁照片");
      return;
    }
    if (!destructionPerson.trim()) {
      addToast("error", "请填写销毁人");
      return;
    }

    setSubmitting(true);
    try {
      await destructionApi.confirm(confirmingId!, {
        destructionPhoto,
        destructionPerson: destructionPerson.trim(),
      });
      addToast("success", "销毁确认成功");
      closeConfirm();
      load();
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmingSample = samples.find((s) => s.id === confirmingId);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-danger-500 flex items-center justify-center text-white">
            <Trash2 size={20} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-800">
              销毁确认
            </h1>
            <p className="text-sm text-gray-500">
              处理到期样品，拍照确认销毁流程
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center text-gray-400 py-12">加载中...</div>
      ) : samples.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-success-500" />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-1">
            太棒了！所有样品已处理
          </p>
          <p className="text-sm text-gray-500">暂无待销毁样品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {samples.map((s) => (
            <div
              key={s.id}
              className={`card border-2 transition-all ${
                s.status === "expired"
                  ? "border-danger-200 bg-danger-50/30"
                  : "border-warning-200 bg-warning-50/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {s.product?.photoUrl ? (
                    <img
                      src={s.product.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Box size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium text-gray-800">
                      {s.product?.name || "未知商品"}
                    </h3>
                    <span
                      className={`badge ${
                        s.status === "expired" ? "badge-danger" : "badge-warning"
                      }`}
                    >
                      {s.status === "expired" ? "已到期" : "即将到期"}
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      <span>
                        {s.status === "expired"
                          ? `已过期 ${getTimeRemaining(s.expireTime).replace("已到期", "").trim() || "时间"}`
                          : `剩余 ${getTimeRemaining(s.expireTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Refrigerator size={14} className="text-gray-400" />
                      <span>冷藏格：{s.fridgeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Box size={14} className="text-gray-400" />
                      <span>容器编号：{s.containerNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} className="text-gray-400" />
                      <span>加工人：{s.product?.processor || "-"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    到期时间：{formatDateTime(s.expireTime)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openConfirm(s.id)}
                  className="btn-danger w-full flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  确认销毁
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmingSample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-danger-600" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-gray-800">
                    确认销毁样品
                  </h2>
                  <p className="text-sm text-gray-500">
                    {confirmingSample.product?.name} - {confirmingSample.containerNo}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <ImageUpload
                label="销毁照片 *"
                value={destructionPhoto}
                onChange={setDestructionPhoto}
                placeholder="拍摄销毁过程照片留档"
              />
              <div>
                <label className="label-field">
                  销毁人 <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="请输入销毁人姓名"
                    value={destructionPerson}
                    onChange={(e) => setDestructionPerson(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-warning-50 border border-warning-200">
                <p className="text-sm text-warning-700 flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    销毁后留样记录将被标记为"已销毁"，此操作不可撤销。
                    请确保已正确完成销毁流程并拍摄照片存档。
                  </span>
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={closeConfirm}
                disabled={submitting}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="btn-danger flex items-center gap-2"
              >
                <Check size={18} />
                {submitting ? "确认中..." : "确认销毁"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

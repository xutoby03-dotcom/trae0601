import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  DollarSign,
  Star,
  Calendar,
  Check,
  User,
  Scissors,
} from "lucide-react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useElderStore } from "../store/useElderStore";
import { StarRating } from "../components/StarRating";
import { serviceTypeLabels, serviceTypePrices } from "../types/appointment";
import { formatDate } from "../utils/date";

export function ServiceComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAppointment, updateAppointment, loadAppointments } =
    useAppointmentStore();
  const { getElder, loadElders } = useElderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hairstylePhoto, setHairstylePhoto] = useState("");
  const [fee, setFee] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [nextSuggestedDate, setNextSuggestedDate] = useState("");

  const appointment = id ? getAppointment(id) : undefined;
  const elder = appointment ? getElder(appointment.elderId) : undefined;

  useEffect(() => {
    loadAppointments();
    loadElders();
  }, [loadAppointments, loadElders]);

  useEffect(() => {
    if (appointment) {
      setHairstylePhoto(appointment.hairstylePhoto);
      setFee(appointment.fee || serviceTypePrices[appointment.serviceType] + (appointment.needsShampoo ? 10 : 0));
      setSatisfaction(appointment.satisfaction);
      if (appointment.nextSuggestedTime) {
        setNextSuggestedDate(formatDate(appointment.nextSuggestedTime));
      } else {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);
        setNextSuggestedDate(formatDate(nextDate.toISOString()));
      }
    }
  }, [appointment]);

  if (!appointment || !elder) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHairstylePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canComplete = satisfaction > 0;

  const handleComplete = () => {
    if (!canComplete || !id) return;

    const nextDateTime = nextSuggestedDate
      ? new Date(`${nextSuggestedDate}T10:00:00`).toISOString()
      : "";

    updateAppointment(id, {
      hairstylePhoto,
      fee,
      satisfaction,
      nextSuggestedTime: nextDateTime,
      status: "completed",
    });

    navigate(`/appointments/${id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/appointments/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回详情
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="text-success-500" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">服务完成记录</h1>
          <p className="text-gray-500 mt-2">记录服务结果，完成本次预约</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 overflow-hidden">
              {elder.photo ? (
                <img
                  src={elder.photo}
                  alt={elder.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={22} className="text-primary-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{elder.name}</p>
              <p className="text-sm text-gray-500">
                {serviceTypeLabels[appointment.serviceType]}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              发型照片
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all ${
                hairstylePhoto
                  ? "border-success-300 bg-success-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              {hairstylePhoto ? (
                <div className="relative">
                  <img
                    src={hairstylePhoto}
                    alt="发型照片"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">点击更换照片</span>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Camera
                    size={48}
                    className="mx-auto text-gray-300 mb-3"
                  />
                  <p className="text-gray-500">点击上传发型照片</p>
                  <p className="text-sm text-gray-400 mt-1">记录服务后的发型效果</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <DollarSign size={16} className="inline mr-1" />
              服务费用（元）
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                ¥
              </span>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-primary-600 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Star size={16} className="inline mr-1 text-warning-500 fill-warning-500" />
              服务满意度
            </label>
            <div className="bg-warning-50 rounded-xl p-6">
              <StarRating
                value={satisfaction}
                onChange={setSatisfaction}
                size="lg"
              />
              <p className="text-center mt-3 text-gray-500">
                {satisfaction === 0
                  ? "请为本次服务评分"
                  : satisfaction === 5
                  ? "非常满意！"
                  : satisfaction >= 4
                  ? "比较满意"
                  : satisfaction >= 3
                  ? "一般"
                  : "不太满意"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar size={16} className="inline mr-1" />
              下次建议时间
            </label>
            <input
              type="date"
              value={nextSuggestedDate}
              onChange={(e) => setNextSuggestedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            />
            <p className="text-sm text-gray-500 mt-2">
              建议预约周期：剪发约30天，染发约45天
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              canComplete
                ? "bg-success-500 text-white hover:bg-success-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Check size={22} />
            完成服务
          </button>
          {!canComplete && (
            <p className="text-center text-sm text-gray-500 mt-2">
              请先为服务满意度评分
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

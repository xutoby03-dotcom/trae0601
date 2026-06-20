import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Scissors,
  Droplets,
  Armchair,
  FileText,
  Save,
  ChevronRight,
  Check,
  Sparkles,
  Users,
} from "lucide-react";
import { useElderStore } from "../store/useElderStore";
import { useBarberStore } from "../store/useBarberStore";
import { useAppointmentStore } from "../store/useAppointmentStore";
import type { ServiceType } from "../types/appointment";
import { serviceTypeLabels, serviceTypePrices } from "../types/appointment";
import { mobilityLabels } from "../types/elder";

interface NewAppointmentProps {}

export function AppointmentForm({}: NewAppointmentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { elders, loadElders, getElder } = useElderStore();
  const { barbers, loadBarbers } = useBarberStore();
  const { addAppointment, getAppointment, loadAppointments } = useAppointmentStore();

  const preselectedElderId = (location.state as any)?.elderId;
  const fromAppointmentId = (location.state as any)?.fromAppointmentId;

  const [step, setStep] = useState(1);
  const [selectedElderId, setSelectedElderId] = useState(
    preselectedElderId || ""
  );
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("haircut");
  const [needsShampoo, setNeedsShampoo] = useState(false);
  const [needsWheelchair, setNeedsWheelchair] = useState(false);
  const [needsCompanion, setNeedsCompanion] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadElders();
    loadBarbers();
    loadAppointments();
  }, [loadElders, loadBarbers, loadAppointments]);

  useEffect(() => {
    if (fromAppointmentId) {
      const apt = getAppointment(fromAppointmentId);
      if (apt) {
        if (!selectedElderId) setSelectedElderId(apt.elderId);
        if (!selectedBarberId) setSelectedBarberId(apt.barberId);
        setServiceType(apt.serviceType);
        setNeedsShampoo(apt.needsShampoo);
        setNeedsWheelchair(apt.needsWheelchair);
        setNeedsCompanion(apt.needsCompanion);
      }
    }
  }, [fromAppointmentId, getAppointment, selectedElderId, selectedBarberId]);

  const selectedElder = selectedElderId ? getElder(selectedElderId) : undefined;
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  const totalPrice =
    serviceTypePrices[serviceType] + (needsShampoo ? 10 : 0);

  const handleSubmit = () => {
    if (!selectedElderId || !selectedBarberId || !scheduledDate || !scheduledTime) {
      alert("请填写完整的预约信息");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

    addAppointment({
      elderId: selectedElderId,
      barberId: selectedBarberId,
      scheduledTime: scheduledDateTime.toISOString(),
      serviceType,
      needsShampoo,
      needsWheelchair,
      needsCompanion,
      notes,
    });

    navigate("/appointments");
  };

  const canProceed = () => {
    if (step === 1) return selectedElderId;
    if (step === 2)
      return selectedBarberId && scheduledDate && scheduledTime;
    return true;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回列表
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">新建预约</h1>
        <p className="text-gray-500 mb-8">
          选择老人、理发师和服务项目，完成预约创建
        </p>

        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s ? <Check size={20} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-24 h-1 mx-2 ${
                    step > s ? "bg-primary-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-primary-500" />
                选择老人
              </h2>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {elders.map((elder) => (
                  <div
                    key={elder.id}
                    onClick={() => setSelectedElderId(elder.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedElderId === elder.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {elder.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {elder.age}岁
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">
                            {mobilityLabels[elder.mobility]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {elder.address}
                        </p>
                      </div>
                      {selectedElderId === elder.id && (
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Scissors size={20} className="text-primary-500" />
                选择服务
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  选择理发师
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {barbers.filter(b => b.isActive).map((barber) => (
                    <div
                      key={barber.id}
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                        selectedBarberId === barber.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-2 overflow-hidden">
                        {barber.avatar ? (
                          <img
                            src={barber.avatar}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Scissors size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">{barber.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {barber.specialty}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Sparkles size={12} className="text-warning-500" />
                        <span className="text-xs text-warning-600 font-medium">
                          {barber.rating}分
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    预约日期
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    预约时间
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
                  >
                    <option value="">请选择时间</option>
                    {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  服务项目
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {(Object.keys(serviceTypeLabels) as ServiceType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setServiceType(type)}
                        className={`p-3 rounded-xl border-2 text-sm transition-all ${
                          serviceType === type
                            ? "border-primary-500 bg-primary-50 text-primary-600"
                            : "border-gray-100 hover:border-gray-200 text-gray-600"
                        }`}
                      >
                        {serviceTypeLabels[type]}
                        <div className="text-xs mt-1 opacity-75">
                          ¥{serviceTypePrices[type]}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label
                  onClick={() => setNeedsShampoo(!needsShampoo)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    needsShampoo
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      needsShampoo ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Droplets
                      size={20}
                      className={needsShampoo ? "text-blue-500" : "text-gray-400"}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">需要洗发</p>
                    <p className="text-sm text-gray-500">+¥10</p>
                  </div>
                </label>

                <label
                  onClick={() => setNeedsWheelchair(!needsWheelchair)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    needsWheelchair
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      needsWheelchair ? "bg-purple-100" : "bg-gray-100"
                    }`}
                  >
                    <Armchair
                      size={20}
                      className={
                        needsWheelchair ? "text-purple-500" : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">需要轮椅位</p>
                    <p className="text-sm text-gray-500">特殊需求</p>
                  </div>
                </label>

                <label
                  onClick={() => setNeedsCompanion(!needsCompanion)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    needsCompanion
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      needsCompanion ? "bg-primary-100" : "bg-gray-100"
                    }`}
                  >
                    <Users
                      size={20}
                      className={
                        needsCompanion ? "text-primary-500" : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">家属陪同</p>
                    <p className="text-sm text-gray-500">需家属在场</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  备注
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="其他需要注意的事项"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Save size={20} className="text-primary-500" />
                确认预约信息
              </h2>

              <div className="bg-primary-50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 overflow-hidden">
                    {selectedElder?.photo ? (
                      <img
                        src={selectedElder.photo}
                        alt={selectedElder.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={28} className="text-primary-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedElder?.name}
                    </p>
                    <p className="text-gray-600">{selectedElder?.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-100">
                  <div>
                    <p className="text-sm text-gray-500">理发师</p>
                    <p className="font-medium text-gray-800">
                      {selectedBarber?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">预约时间</p>
                    <p className="font-medium text-gray-800">
                      {scheduledDate} {scheduledTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">服务项目</p>
                    <p className="font-medium text-gray-800">
                      {serviceTypeLabels[serviceType]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">服务费用</p>
                    <p className="font-medium text-primary-600 text-lg">
                      ¥{totalPrice}
                    </p>
                  </div>
                </div>

                {(needsShampoo || needsWheelchair || needsCompanion) && (
                  <div className="mt-4 pt-4 border-t border-primary-100">
                    <p className="text-sm text-gray-500 mb-2">特殊需求</p>
                    <div className="flex gap-2 flex-wrap">
                      {needsShampoo && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                          需要洗发
                        </span>
                      )}
                      {needsWheelchair && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                          需要轮椅位
                        </span>
                      )}
                      {needsCompanion && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm">
                          家属陪同
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="mt-4 pt-4 border-t border-primary-100">
                    <p className="text-sm text-gray-500 mb-1">备注</p>
                    <p className="text-gray-700">{notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft size={18} />
              上一步
            </button>
          ) : (
            <Link
              to="/appointments"
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              取消
            </Link>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                canProceed()
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              下一步
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              <Save size={18} />
              确认预约
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

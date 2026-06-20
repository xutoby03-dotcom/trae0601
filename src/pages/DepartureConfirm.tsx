import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Scissors,
  Shirt,
  Sparkles,
  Banknote,
  Check,
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useElderStore } from "../store/useElderStore";
import { useBarberStore } from "../store/useBarberStore";
import type { PaymentMethod } from "../types/appointment";
import { paymentMethodLabels, serviceTypeLabels } from "../types/appointment";
import { formatDateTime } from "../utils/date";

interface ChecklistItem {
  key: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

export function DepartureConfirm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAppointment, updateAppointment, loadAppointments } =
    useAppointmentStore();
  const { getElder, loadElders } = useElderStore();
  const { getBarber, loadBarbers } = useBarberStore();

  const [toolsChecked, setToolsChecked] = useState(false);
  const [capeChecked, setCapeChecked] = useState(false);
  const [disinfectionChecked, setDisinfectionChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );

  const appointment = id ? getAppointment(id) : undefined;
  const elder = appointment ? getElder(appointment.elderId) : undefined;
  const barber = appointment ? getBarber(appointment.barberId) : undefined;

  useEffect(() => {
    loadAppointments();
    loadElders();
    loadBarbers();
  }, [loadAppointments, loadElders, loadBarbers]);

  useEffect(() => {
    if (appointment) {
      setToolsChecked(appointment.toolsChecked);
      setCapeChecked(appointment.capeChecked);
      setDisinfectionChecked(appointment.disinfectionChecked);
      setPaymentMethod(appointment.paymentMethod);
    }
  }, [appointment]);

  if (!appointment || !elder) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  const checklistItems: ChecklistItem[] = [
    {
      key: "tools",
      label: "理发工具",
      description: "剪刀、梳子、电推剪、剃须刀等",
      icon: Scissors,
      color: "text-primary-500",
      bgColor: "bg-primary-100",
    },
    {
      key: "cape",
      label: "围布",
      description: "理发围布、毛巾",
      icon: Shirt,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      key: "disinfection",
      label: "消毒用品",
      description: "酒精棉片、消毒液、一次性手套",
      icon: Sparkles,
      color: "text-success-500",
      bgColor: "bg-success-100",
    },
  ];

  const paymentMethods: Array<{ key: PaymentMethod; label: string }> = [
    { key: "cash", label: "现金" },
    { key: "wechat", label: "微信支付" },
    { key: "alipay", label: "支付宝" },
    { key: "card", label: "银行卡" },
  ];

  const allChecked = toolsChecked && capeChecked && disinfectionChecked && paymentMethod;

  const toggleCheck = (key: string) => {
    switch (key) {
      case "tools":
        setToolsChecked(!toolsChecked);
        break;
      case "cape":
        setCapeChecked(!capeChecked);
        break;
      case "disinfection":
        setDisinfectionChecked(!disinfectionChecked);
        break;
    }
  };

  const handleDepart = () => {
    if (!allChecked || !id) return;

    updateAppointment(id, {
      toolsChecked,
      capeChecked,
      disinfectionChecked,
      paymentMethod: paymentMethod!,
      status: "departed",
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
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="text-primary-500" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">出发前确认</h1>
          <p className="text-gray-500 mt-2">请确认所有工具和物品已准备就绪</p>
        </div>

        <div className="bg-primary-50 rounded-xl p-5 mb-8">
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
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {elder.address}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-primary-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} className="text-primary-500" />
              {formatDateTime(appointment.scheduledTime)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Scissors size={16} className="text-primary-500" />
              {serviceTypeLabels[appointment.serviceType]}
            </div>
            {barber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} className="text-primary-500" />
                {barber.name}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone size={20} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">紧急联系人</p>
              <p className="font-semibold text-gray-800">{elder.contactName}</p>
            </div>
            <a
              href={`tel:${elder.contactPhone}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <Phone size={16} />
              拨打电话
            </a>
          </div>
          <div className="pl-13">
            <p className="text-xl font-bold text-blue-600 tracking-wider">
              {elder.contactPhone}
            </p>
          </div>
        </div>

        {appointment.needsCompanion && (
          <div className="bg-warning-50 border-2 border-warning-200 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={20} className="text-warning-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-warning-700 flex items-center gap-2">
                  <Users size={18} />
                  需要家属陪同
                </p>
                <p className="text-sm text-warning-600 mt-1">
                  上门服务前请确认家属已在场，如无人陪同请及时联系
                </p>
              </div>
            </div>
          </div>
        )}

        {(appointment.needsShampoo || appointment.needsWheelchair) && (
          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">特殊需求</h3>
            <div className="flex gap-2 flex-wrap">
              {appointment.needsShampoo && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">
                  需要洗发
                </span>
              )}
              {appointment.needsWheelchair && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium">
                  需要轮椅位
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800">物品清单</h2>
          {checklistItems.map((item) => {
            const isChecked =
              (item.key === "tools" && toolsChecked) ||
              (item.key === "cape" && capeChecked) ||
              (item.key === "disinfection" && disinfectionChecked);

            return (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isChecked
                    ? "border-success-400 bg-success-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isChecked ? item.bgColor : "bg-gray-100"
                  }`}
                >
                  <item.icon
                    size={24}
                    className={isChecked ? item.color : "text-gray-400"}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isChecked ? "text-gray-800" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isChecked
                      ? "bg-success-500 text-white"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  <Check size={18} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800">收款方式</h2>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.key}
                onClick={() => setPaymentMethod(method.key)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === method.key
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    paymentMethod === method.key
                      ? "bg-primary-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Banknote
                    size={18}
                    className={
                      paymentMethod === method.key
                        ? "text-primary-500"
                        : "text-gray-400"
                    }
                  />
                </div>
                <span
                  className={`font-medium ${
                    paymentMethod === method.key
                      ? "text-primary-600"
                      : "text-gray-600"
                  }`}
                >
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDepart}
          disabled={!allChecked}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            allChecked
              ? "bg-primary-500 text-white hover:bg-primary-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {allChecked ? (
            <>
              <Check size={22} />
              确认出发
            </>
          ) : (
            "请完成所有检查项"
          )}
        </button>
      </div>
    </div>
  );
}

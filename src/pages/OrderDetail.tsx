import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Phone,
  Hash,
  Package,
  AlertTriangle,
} from "lucide-react";
import { usePetStore } from "@/store/usePetStore";
import PetProfileCard from "@/components/order/PetProfileCard";
import StepTimeline from "@/components/order/StepTimeline";
import AbnormalityPanel from "@/components/order/AbnormalityPanel";
import { getRemainingTime, formatDateTime } from "@/utils/time";
import { STEP_META } from "@/types";

const statusConfig: Record<string, { label: string; className: string }> = {
  queuing: {
    label: "排队中",
    className: "bg-primary-50 text-primary-600 border-primary-100",
  },
  in_progress: {
    label: "进行中",
    className: "bg-blue-50 text-blue-600 border-blue-100",
  },
  completed: {
    label: "已完成",
    className:
      "bg-success-400/20 text-success-600 border-success-400/30",
  },
  overdue: {
    label: "已超时",
    className: "bg-danger-500/15 text-danger-600 border-danger-500/30",
  },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const order = usePetStore((s) => s.getOrderById(id || ""));

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-brown-700/60 mb-4">未找到该订单</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          返回看板
        </button>
      </div>
    );
  }

  const remaining = getRemainingTime(order.estimatedFinish);
  const currentStep = order.steps.find((s) => s.status === "in_progress");
  const status = statusConfig[order.status];
  const currentStepName = currentStep
    ? STEP_META[currentStep.stepType].name
    : order.status === "completed"
    ? "全部完成"
    : "等待开始";

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="mb-6 animate-fade-in-up">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brown-700/60 hover:text-brown-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回看板
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold text-brown-900">
                订单详情
              </h1>
              <span className={`chip border ${status.className}`}>
                {status.label}
              </span>
              {order.abnormalities.length > 0 && (
                <span className="chip bg-danger-500/15 text-danger-600 border-danger-500/30 border">
                  <AlertTriangle className="w-3 h-3" />
                  有异常
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-brown-700/60">
              <span className="inline-flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                {order.queueNumber}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                {order.package.name} · ¥{order.package.price}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {order.ownerPhone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                创建于 {formatDateTime(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`text-lg font-display font-bold ${
                remaining.isOverdue ? "text-danger-500" : "text-primary-600"
              }`}
            >
              {remaining.text}
            </div>
            <p className="text-sm text-brown-700/60">
              预计完成 {formatDateTime(order.estimatedFinish)}
            </p>
            <p className="text-sm text-brown-700/70 mt-1">
              当前：{currentStepName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <PetProfileCard pet={order.pet} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <StepTimeline order={order} />
          <AbnormalityPanel order={order} />
        </div>
      </div>
    </div>
  );
}

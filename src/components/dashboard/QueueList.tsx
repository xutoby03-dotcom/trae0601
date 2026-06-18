import {
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Order, STEP_META } from "@/types";
import { getWaitDuration, getRemainingTime, formatTime } from "@/utils/time";

interface QueueListProps {
  orders: Order[];
}

const statusConfig: Record<
  Order["status"],
  { label: string; chipClass: string; dotClass: string }
> = {
  queuing: {
    label: "排队中",
    chipClass: "bg-primary-50 text-primary-600 border-primary-100",
    dotClass: "bg-primary-500",
  },
  in_progress: {
    label: "进行中",
    chipClass: "bg-blue-50 text-blue-600 border-blue-100",
    dotClass: "bg-blue-500",
  },
  completed: {
    label: "已完成",
    chipClass: "bg-success-400/20 text-success-600 border-success-400/30",
    dotClass: "bg-success-500",
  },
  overdue: {
    label: "已超时",
    chipClass: "bg-danger-500/15 text-danger-600 border-danger-500/30",
    dotClass: "bg-danger-500",
  },
};

export default function QueueList({ orders }: QueueListProps) {
  const navigate = useNavigate();

  const sortedOrders = [...orders]
    .filter((o) => o.status !== "completed")
    .sort((a, b) => {
    const orderStatus = { overdue: 0, in_progress: 1, queuing: 2 };
    return orderStatus[a.status] - orderStatus[b.status];
  });

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between p-5 pb-3 border-b border-cream-200">
      <h3 className="font-display font-bold text-brown-900 text-lg">
        排队与进行中
      </h3>
      <span className="chip bg-cream-100 text-brown-700/70">
        {sortedOrders.length} 单
      </span>
    </div>

      <div className="max-h-[520px overflow-y-auto p-2">
        {sortedOrders.map((order, idx) => {
          const status = statusConfig[order.status];
          const currentStep = order.steps.find((s) => s.status === "in_progress");
          const currentStepMeta = currentStep
            ? STEP_META[currentStep.stepType]
            : null;
          const completedSteps = order.steps.filter(
            (s) => s.status === "completed"
          ).length;
          const progress = (completedSteps / order.steps.length) * 100;
          const remaining = getRemainingTime(order.estimatedFinish);
          const hasAbnormal = order.abnormalities.length > 0;

          const isOverdue = order.status === "overdue";

          return (
            <button
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className={`w-full text-left p-4 my-1 rounded-2xl transition-all group hover:bg-cream-50 ${
                isOverdue ? "animate-danger-blink border-2 border-danger-500/40" : ""
              }`}
              style={{ animationDelay: `${100 + idx * 50}ms` }}
            >
              <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl overflow-hidden ring-2 ${
                    order.status === "in_progress" ? "ring-primary-300 animate-pulse-ring" : "ring-transparent"
                  }`}
                >
                  <img
                    src={order.pet.photoUrl}
                    alt={order.pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -left-1 min-w-[28px] h-7 px-1.5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-primary-200">
                  {order.queueNumber.slice(1)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-brown-900 truncate">
                    {order.pet.name}
                  </h4>
                  {hasAbnormal && (
                    <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                  )}
                  <span
                    className={`chip ${status.chipClass} border ml-auto flex-shrink-0`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                    />
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-brown-700/60 mb-2 truncate">
                  {order.pet.breed} · {order.package.name}
                </p>

                {currentStepMeta && (
                  <div className="flex items-center gap-3 text-xs text-brown-700/70 mb-2">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    当前: {currentStepMeta.name}
                  </span>
                  <span>·</span>
                  <span>{formatTime(currentStep?.startTime)}</span>
                </div>
                )}

                <div className="w-full h-1.5 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverdue ? "bg-danger-500" : "bg-primary-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className={`text-sm font-medium ${
                    remaining.isOverdue
                      ? "text-danger-600"
                      : "text-brown-700/70"
                  }`}
                >
                  {remaining.isOverdue ? (
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                  ) : null}
                  {remaining.text}
                </span>
                <span className="text-xs text-brown-700/50">
                  {getWaitDuration(order.createdAt)}
                </span>
                <ChevronRight className="w-5 h-5 text-brown-700/30 group-hover:translate-x-1 group-hover:text-primary-500 transition-all" />
              </div>
            </div>
            </button>
          );
        })}

        {sortedOrders.length === 0 && (
          <div className="p-12 text-center text-brown-700/50">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>当前没有待处理订单</p>
          </div>
        )}
      </div>
    </div>
  );
}

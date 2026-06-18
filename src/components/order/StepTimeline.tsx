import { useState } from "react";
import {
  ClipboardList,
  Bath,
  Wind,
  Scissors,
  PawPrint,
  Camera,
  Check,
  Clock,
  ChevronDown,
  User,
  Image,
} from "lucide-react";
import {
  Order,
  OrderStep,
  StepType,
  STEP_META,
  Employee,
} from "@/types";
import { formatTime } from "@/utils/time";
import { usePetStore } from "@/store/usePetStore";

const stepIcons: Record<StepType, any> = {
  reception: ClipboardList,
  bath: Bath,
  dry: Wind,
  trim: Scissors,
  ear_paw_care: PawPrint,
  photo_delivery: Camera,
};

interface StepTimelineProps {
  order: Order;
}

export default function StepTimeline({ order }: StepTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<StepType | null>(null);
  const { employees, startStep, completeStep } = usePetStore();

  const sortedSteps = [...order.steps].sort(
    (a, b) => STEP_META[a.stepType].order - STEP_META[b.stepType].order
  );

  const getEmployee = (id?: string) =>
    id ? employees.find((e) => e.id === id) : null;

  const handleStartStep = (step: OrderStep) => {
    const groomer = employees.find((e) => e.role === "groomer");
    if (groomer) {
      startStep(order.id, step.stepType, groomer.id);
    }
  };

  const handleCompleteStep = (step: OrderStep) => {
    completeStep(order.id, step.stepType);
  };

  return (
    <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
      <h3 className="font-display font-bold text-brown-900 text-lg mb-6">
        服务流程
      </h3>

      <div className="relative">
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-cream-200" />

        {sortedSteps.map((step, idx) => {
          const meta = STEP_META[step.stepType];
          const Icon = stepIcons[step.stepType];
          const emp = getEmployee(step.employeeId);
          const isExpanded = expandedStep === step.stepType;
          const isLast = idx === sortedSteps.length - 1;

          let nodeStyle = "";
          let iconStyle = "";
          if (step.status === "completed") {
            nodeStyle = "bg-success-500 shadow-md shadow-success-500/30";
            iconStyle = "text-white";
          } else if (step.status === "in_progress") {
            nodeStyle =
              "bg-primary-500 shadow-lg shadow-primary-500/40 animate-pulse-ring";
            iconStyle = "text-white";
          } else {
            nodeStyle = "bg-white border-2 border-cream-200";
            iconStyle = "text-brown-700/30";
          }

          return (
            <div
              key={step.id}
              className="relative pl-16 pb-6 last:pb-0 animate-fade-in-up"
              style={{ animationDelay: `${200 + idx * 80}ms` }}
            >
              <div
                className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${nodeStyle}`}
              >
                {step.status === "completed" ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={`w-5 h-5 ${iconStyle}`} />
                )}
              </div>

              <div
                className="cursor-pointer group"
                onClick={() =>
                  setExpandedStep(isExpanded ? null : step.stepType)
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-semibold ${
                        step.status === "pending"
                          ? "text-brown-700/50"
                          : "text-brown-900"
                      }`}
                    >
                      {meta.name}
                    </h4>
                    {step.status === "completed" && (
                      <span className="chip bg-success-400/20 text-success-600 text-[10px]">
                        <Check className="w-3 h-3" />
                        完成
                      </span>
                    )}
                    {step.status === "in_progress" && (
                      <span className="chip bg-primary-50 text-primary-600 text-[10px]">
                        <Clock className="w-3 h-3" />
                        进行中
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-brown-700/40 transition-transform group-hover:text-brown-700/70 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-brown-700/60">
                  {step.startTime && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      开始 {formatTime(step.startTime)}
                      {step.endTime && ` - ${formatTime(step.endTime)}`}
                    </span>
                  )}
                  {emp && (
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {emp.name}
                    </span>
                  )}
                  {step.photoUrl && (
                    <span className="inline-flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" />
                      照片
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 p-4 bg-cream-50 rounded-2xl animate-fade-in-up">
                    {step.photoUrl && (
                      <div className="mb-4">
                        <p className="text-xs text-brown-700/60 mb-2">
                          步骤照片
                        </p>
                        <div className="w-full h-40 rounded-xl overflow-hidden">
                          <img
                            src={step.photoUrl}
                            alt={meta.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {step.notes && (
                      <div>
                        <p className="text-xs text-brown-700/60 mb-1">备注</p>
                        <p className="text-sm text-brown-800">{step.notes}</p>
                      </div>
                    )}

                    {step.status === "pending" &&
                      idx > 0 &&
                      sortedSteps[idx - 1].status !== "completed" && (
                        <p className="text-sm text-brown-700/50">
                          请先完成上一步
                        </p>
                      )}

                    {step.status === "pending" &&
                      (idx === 0 ||
                        sortedSteps[idx - 1].status === "completed") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartStep(step);
                          }}
                          className="btn-primary text-sm mt-2"
                        >
                          开始{meta.name}
                        </button>
                      )}

                    {step.status === "in_progress" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteStep(step);
                        }}
                        className="btn-primary text-sm mt-2"
                      >
                        <Check className="w-4 h-4" />
                        完成{meta.name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

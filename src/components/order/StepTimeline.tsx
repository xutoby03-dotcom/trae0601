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
  Link,
  X,
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

const samplePhotos = [
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
];

interface StepTimelineProps {
  order: Order;
}

export default function StepTimeline({ order }: StepTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<StepType | null>(null);
  const [stepPhotoUrls, setStepPhotoUrls] = useState<Record<string, string>>({});
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const { employees, startStep, completeStep } = usePetStore();

  const sortedSteps = [...order.steps].sort(
    (a, b) => STEP_META[a.stepType].order - STEP_META[b.stepType].order
  );

  const getEmployee = (id?: string): Employee | undefined =>
    id ? employees.find((e) => e.id === id) : undefined;

  const handleStartStep = (step: OrderStep) => {
    const groomer = employees.find((e) => e.role === "groomer");
    if (groomer) {
      startStep(order.id, step.stepType, groomer.id);
    }
  };

  const handleCompleteStep = (step: OrderStep) => {
    const photoUrl = stepPhotoUrls[step.id] || "";
    const notes = stepNotes[step.id] || "";
    completeStep(order.id, step.stepType, photoUrl, notes);
    setStepPhotoUrls((prev) => {
      const next = { ...prev };
      delete next[step.id];
      return next;
    });
    setStepNotes((prev) => {
      const next = { ...prev };
      delete next[step.id];
      return next;
    });
  };

  const setPhotoUrl = (stepId: string, url: string) => {
    setStepPhotoUrls((prev) => ({ ...prev, [stepId]: url }));
  };

  const setNote = (stepId: string, text: string) => {
    setStepNotes((prev) => ({ ...prev, [stepId]: text }));
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
          const currentPhotoUrl = stepPhotoUrls[step.id] || step.photoUrl || "";
          const currentNote = stepNotes[step.id] || step.notes || "";

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
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="flex items-center gap-2">
                    {step.photoUrl && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                        <img
                          src={step.photoUrl}
                          alt={meta.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-brown-700/40 transition-transform group-hover:text-brown-700/70 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-brown-700/60 flex-wrap">
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
                    <span className="inline-flex items-center gap-1 text-primary-600">
                      <Image className="w-3.5 h-3.5" />
                      已上传照片
                    </span>
                  )}
                </div>

                {step.photoUrl && (
                  <div className="mt-2.5">
                    <div className="w-24 h-20 rounded-lg overflow-hidden ring-2 ring-white shadow-sm">
                      <img
                        src={step.photoUrl}
                        alt={meta.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div
                    className="mt-4 p-4 bg-cream-50 rounded-2xl animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {step.photoUrl && (
                      <div className="mb-4">
                        <p className="text-xs text-brown-700/60 mb-2">
                          步骤照片
                        </p>
                        <div className="w-full h-48 rounded-xl overflow-hidden">
                          <img
                            src={step.photoUrl}
                            alt={meta.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {step.status === "completed" && step.notes && (
                      <div className="mb-4">
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
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="label-text mb-0 flex items-center gap-1">
                              <Camera className="w-4 h-4" />
                              上传照片
                            </p>
                            {currentPhotoUrl && (
                              <button
                                onClick={() => setPhotoUrl(step.id, "")}
                                className="text-xs text-brown-700/50 hover:text-danger-500 inline-flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                清除
                              </button>
                            )}
                          </div>

                          {currentPhotoUrl && (
                            <div className="mb-3 w-40 h-32 rounded-xl overflow-hidden ring-2 ring-primary-200">
                              <img
                                src={currentPhotoUrl}
                                alt="预览"
                                className="w-full h-full object-cover"
                                onError={() => setPhotoUrl(step.id, "")}
                              />
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Link className="w-3.5 h-3.5 text-brown-700/50" />
                              <span className="text-xs text-brown-700/60">
                                图片链接
                              </span>
                            </div>
                            <input
                              type="url"
                              value={stepPhotoUrls[step.id] || ""}
                              onChange={(e) =>
                                setPhotoUrl(step.id, e.target.value)
                              }
                              placeholder="粘贴图片URL..."
                              className="input-field text-sm"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Image className="w-3.5 h-3.5 text-brown-700/50" />
                              <span className="text-xs text-brown-700/60">
                                或选择示例图
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {samplePhotos.map((url, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPhotoUrl(step.id, url)}
                                  className={`aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                                    currentPhotoUrl === url
                                      ? "ring-2 ring-primary-500 ring-offset-2"
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

                        <div>
                          <p className="label-text mb-1">步骤备注</p>
                          <textarea
                            value={stepNotes[step.id] || ""}
                            onChange={(e) => setNote(step.id, e.target.value)}
                            placeholder="记录本步骤的特殊情况..."
                            className="input-field resize-none h-20 text-sm"
                          />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteStep(step);
                          }}
                          className="btn-primary text-sm"
                        >
                          <Check className="w-4 h-4" />
                          完成{meta.name}
                          {currentPhotoUrl && "（含照片）"}
                        </button>
                      </div>
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

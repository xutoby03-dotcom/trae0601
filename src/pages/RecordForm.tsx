import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAppStore } from "@/store";
import { FEELING_OPTIONS } from "@/utils/bpUtils";
import { useState } from "react";

const recordSchema = z.object({
  elderId: z.string().min(1, "请选择老人"),
  systolic: z.number().min(50, "高压范围50-250").max(250),
  diastolic: z.number().min(30, "低压范围30-180").max(180),
  heartRate: z.number().min(30, "心率范围30-220").max(220),
  measureTime: z.string().min(1, "请选择测量时间"),
  feeling: z.string().min(1, "请选择身体感受"),
  photo: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

export default function RecordForm() {
  const navigate = useNavigate();
  const { originalRecordId } = useParams();
  const { profiles, records, addRecord, completeRetest, selectedElderId } = useAppStore();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();

  const originalRecord = originalRecordId
    ? records.find((r) => r.id === originalRecordId)
    : null;
  const isRetest = !!originalRecord;

  const defaultElderId = isRetest
    ? originalRecord!.elderId
    : selectedElderId || profiles[0]?.id || "";

  const defaultMeasureTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      elderId: defaultElderId,
      systolic: isRetest ? 0 : 120,
      diastolic: isRetest ? 0 : 80,
      heartRate: isRetest ? 0 : 72,
      measureTime: defaultMeasureTime,
      feeling: "无不适",
    },
  });

  const selectedElder = profiles.find((p) => p.id === watch("elderId"));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setValue("photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: RecordFormData) => {
    const recordData = {
      ...(data as Required<RecordFormData>),
      measureTime: new Date(data.measureTime).toISOString(),
    };

    if (isRetest && originalRecord) {
      const newRecord = addRecord(recordData, true, originalRecord.id);
      completeRetest(originalRecord.id, newRecord.id);
    } else {
      addRecord(recordData);
    }

    navigate("/records");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/records")}
          className="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title flex items-center gap-2">
            {isRetest && <RefreshCw className="w-6 h-6 text-primary-600" />}
            {isRetest ? "复测血压" : "记录血压"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isRetest ? "请在30分钟内完成复测" : "记录本次血压测量数据"}
          </p>
        </div>
      </div>

      {isRetest && originalRecord && (
        <div className="card mb-6 bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700 font-medium mb-2">原始测量数据</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-serif text-amber-800">
                {originalRecord.systolic}/{originalRecord.diastolic}
              </span>
              <span className="text-amber-700">mmHg</span>
            </div>
            <div className="text-sm text-amber-600">
              心率 {originalRecord.heartRate} bpm
            </div>
            <div className="text-sm text-amber-600">
              {format(new Date(originalRecord.measureTime), "HH:mm")} 测量
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="mb-4">
            <label className="label-text">选择老人</label>
            <select {...register("elderId")} className="input-field" disabled={isRetest}>
              <option value="">请选择</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}（{p.age}岁）
                </option>
              ))}
            </select>
            {errors.elderId && (
              <p className="text-danger-500 text-sm mt-1">{errors.elderId.message}</p>
            )}
            {selectedElder && (
              <p className="text-xs text-gray-500 mt-2">
                目标范围：高压 {selectedElder.targetRange.systolicMin}-
                {selectedElder.targetRange.systolicMax} / 低压{" "}
                {selectedElder.targetRange.diastolicMin}-
                {selectedElder.targetRange.diastolicMax} mmHg
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label-text">高压 (mmHg)</label>
              <input
                {...register("systolic", { valueAsNumber: true })}
                type="number"
                className="input-field text-center text-2xl font-bold font-serif"
                placeholder="120"
              />
              {errors.systolic && (
                <p className="text-danger-500 text-sm mt-1">{errors.systolic.message}</p>
              )}
            </div>
            <div>
              <label className="label-text">低压 (mmHg)</label>
              <input
                {...register("diastolic", { valueAsNumber: true })}
                type="number"
                className="input-field text-center text-2xl font-bold font-serif"
                placeholder="80"
              />
              {errors.diastolic && (
                <p className="text-danger-500 text-sm mt-1">{errors.diastolic.message}</p>
              )}
            </div>
            <div>
              <label className="label-text">心率 (bpm)</label>
              <input
                {...register("heartRate", { valueAsNumber: true })}
                type="number"
                className="input-field text-center text-2xl font-bold font-serif"
                placeholder="72"
              />
              {errors.heartRate && (
                <p className="text-danger-500 text-sm mt-1">{errors.heartRate.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="label-text">测量时间</label>
            <input
              {...register("measureTime")}
              type="datetime-local"
              className="input-field"
            />
            {errors.measureTime && (
              <p className="text-danger-500 text-sm mt-1">{errors.measureTime.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="label-text">身体感受</label>
            <div className="grid grid-cols-4 gap-2">
              {FEELING_OPTIONS.map((feeling) => (
                <label
                  key={feeling}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    watch("feeling") === feeling
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("feeling")}
                    value={feeling}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">
                    {feeling === "无不适"
                      ? "😊"
                      : feeling === "头晕"
                      ? "😵"
                      : feeling === "头痛"
                      ? "🤕"
                      : feeling === "胸闷"
                      ? "😣"
                      : feeling === "心悸"
                      ? "💓"
                      : feeling === "乏力"
                      ? "😮‍💨"
                      : "🤢"}
                  </span>
                  <span className="text-xs text-gray-700">{feeling}</span>
                </label>
              ))}
            </div>
            {errors.feeling && (
              <p className="text-danger-500 text-sm mt-1">{errors.feeling.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">测量照片（可选）</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer transition-colors overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="预览" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(undefined);
                    setValue("photo", undefined);
                  }}
                  className="text-sm text-gray-500 hover:text-danger-600"
                >
                  移除照片
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate("/records")} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {isRetest ? "保存复测" : "保存记录"}
          </button>
        </div>
      </form>
    </div>
  );
}

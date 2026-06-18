import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  RefreshCw,
  CheckCircle2,
  QrCode,
  CreditCard,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAppStore } from "@/store/useAppStore";
import { CHECK_ITEMS, DEVICE_TYPE_LABELS, FOOT_PAD_REPLACE_THRESHOLD } from "@/types";
import { formatDate, cn } from "@/utils/helpers";

export default function QuickCard() {
  const navigate = useNavigate();
  const { devices, getCheckRecordsByDevice } = useAppStore();

  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || "");
  const [cardGenerated, setCardGenerated] = useState(false);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const lastCheckRecord = selectedDevice
    ? getCheckRecordsByDevice(selectedDevice.id)[0]
    : null;

  const needsFootPadReplace =
    selectedDevice?.footPadUsageDays &&
    selectedDevice.footPadUsageDays >= FOOT_PAD_REPLACE_THRESHOLD;

  const handlePrint = () => {
    window.print();
  };

  const handleGenerate = () => {
    setCardGenerated(true);
  };

  const handleReset = () => {
    setCardGenerated(false);
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📇 快速检查卡</h1>
            <p className="text-gray-500 text-sm">
              复诊或出门前的快速检查清单
            </p>
          </div>
        </div>
        {cardGenerated && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              重新生成
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              打印检查卡
            </button>
          </div>
        )}
      </div>

      {!cardGenerated ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-6 card-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              选择设备
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    selectedDeviceId === device.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-200"
                  )}
                >
                  <img
                    src={device.photo}
                    alt={device.userName}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {device.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {device.serialNumber}
                    </p>
                    <p className="text-xs text-primary-600">
                      {DEVICE_TYPE_LABELS[device.type]}
                    </p>
                  </div>
                  {selectedDeviceId === device.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-medical-50 to-primary-50 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-medical-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-medical-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    快速检查卡用途
                  </h3>
                  <p className="text-sm text-gray-600">
                    生成的检查卡包含设备基本信息和日常检查要点，可打印出来随身携带。
                    在复诊、出门旅行或需要临时交予他人使用时，可快速了解设备状态。
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedDeviceId}
              className={cn(
                "w-full btn-primary text-lg py-4 flex items-center justify-center gap-2",
                !selectedDeviceId && "opacity-50 cursor-not-allowed"
              )}
            >
              <QrCode className="w-6 h-6" />
              生成快速检查卡
            </button>
          </div>
        </div>
      ) : (
        selectedDevice && (
          <div className="max-w-2xl mx-auto">
            <div className="print-card bg-white rounded-3xl overflow-hidden border-2 border-gray-800">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">助行器快速检查卡</h2>
                    <p className="text-white/80">
                      生成日期: {formatDate(new Date())}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-2xl">
                    <QRCodeSVG
                      value={`https://walker-care.example.com/device/${selectedDevice.id}`}
                      size={80}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-6">
                  <img
                    src={selectedDevice.photo}
                    alt={selectedDevice.userName}
                    className="w-28 h-28 rounded-2xl object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedDevice.userName}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">设备编号：</span>
                        <span className="font-semibold text-gray-800">
                          {selectedDevice.serialNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">设备类型：</span>
                        <span className="font-semibold text-gray-800">
                          {DEVICE_TYPE_LABELS[selectedDevice.type]}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">身高适配：</span>
                        <span className="font-semibold text-gray-800">
                          {selectedDevice.heightAdapt}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">折叠方式：</span>
                        <span className="font-semibold text-gray-800">
                          {selectedDevice.foldType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">购买日期：</span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(selectedDevice.purchaseDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">上次检查：</span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(selectedDevice.lastCheckDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {needsFootPadReplace && (
                  <div className="bg-warning-50 border-2 border-warning-300 rounded-2xl p-4">
                    <p className="text-warning-700 font-bold flex items-center gap-2">
                      ⚠️ 重要提醒：脚垫已使用{" "}
                      {selectedDevice.footPadUsageDays} 天，建议立即更换！
                    </p>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    ✅ 出门前检查清单
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {CHECK_ITEMS.map((item, index) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-8 h-8 border-2 border-gray-400 rounded-lg flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {lastCheckRecord && (
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">
                      📋 最近检查结果
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {CHECK_ITEMS.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center gap-2"
                        >
                          {lastCheckRecord[item.key] ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-warning-600 font-bold">✗</span>
                          )}
                          <span className="text-gray-700">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    {lastCheckRecord.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        💬 备注: {lastCheckRecord.notes}
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-6 text-center">
                  <p className="text-sm text-gray-500">
                    本检查卡由助行器维护系统自动生成 · 扫描二维码查看详细信息
                  </p>
                </div>
              </div>
            </div>

            <div className="no-print mt-6 bg-medical-50 border-2 border-medical-200 rounded-2xl p-4">
              <h4 className="font-semibold text-medical-800 mb-2">
                💡 使用建议
              </h4>
              <ul className="text-sm text-medical-700 space-y-1">
                <li>• 建议将检查卡打印出来，随助行器一起存放</li>
                <li>• 每次出门或复诊前，对照清单逐项检查</li>
                <li>• 如发现异常，及时记录并联系维修人员</li>
                <li>• 建议每7天重新生成一次检查卡，确保信息最新</li>
              </ul>
            </div>
          </div>
        )
      )}
    </div>
  );
}

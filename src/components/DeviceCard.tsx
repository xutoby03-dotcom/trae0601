import { Link } from "react-router-dom";
import { Edit3, Eye, Calendar, User, Tag } from "lucide-react";
import type { Device } from "@/types";
import { DEVICE_TYPE_LABELS, FOOT_PAD_REPLACE_THRESHOLD } from "@/types";
import { formatDate, cn } from "@/utils/helpers";

interface DeviceCardProps {
  device: Device;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const needsFootPadReplace = device.footPadUsageDays >= FOOT_PAD_REPLACE_THRESHOLD;

  return (
    <div className="bg-white rounded-3xl overflow-hidden card-shadow card-hover group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={device.photo}
          alt={device.serialNumber}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-600 text-sm font-semibold rounded-full">
            {DEVICE_TYPE_LABELS[device.type]}
          </span>
        </div>
        {needsFootPadReplace && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-warning-500 text-white text-sm font-semibold rounded-full animate-pulse-soft">
              ⚠️ 脚垫需更换
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{device.userName}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {device.serialNumber}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>身高适配: {device.heightAdapt}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>购买日期: {formatDate(device.purchaseDate)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm">
            <span className="text-gray-500">脚垫使用 </span>
            <span
              className={cn(
                "font-semibold",
                needsFootPadReplace ? "text-warning-600" : "text-gray-700"
              )}
            >
              {device.footPadUsageDays}天
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/devices/${device.id}`}
              className="p-2 rounded-xl bg-medical-50 text-medical-600 hover:bg-medical-100 transition-colors"
            >
              <Eye className="w-5 h-5" />
            </Link>
            <Link
              to={`/devices/${device.id}/edit`}
              className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

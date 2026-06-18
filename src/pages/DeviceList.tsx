import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import DeviceCard from "@/components/DeviceCard";
import { useAppStore } from "@/store/useAppStore";

export default function DeviceList() {
  const navigate = useNavigate();
  const { devices } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDevices = devices.filter(
    (device) =>
      device.userName.includes(searchTerm) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 设备档案</h1>
          <p className="text-gray-500 mt-1">共 {devices.length} 台助行器设备</p>
        </div>
        <button
          onClick={() => navigate("/devices/new")}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增设备
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索使用人或设备编号..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {filteredDevices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl card-shadow">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? "未找到匹配的设备" : "暂无设备档案"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? "请尝试其他搜索关键词" : "点击上方按钮添加第一台设备"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/devices/new")}
              className="btn-primary"
            >
              新增设备
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device, index) => (
            <div
              key={device.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <DeviceCard device={device} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

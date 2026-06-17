import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Plus, Package2, Trash2, Minus, Search } from 'lucide-react';
import DeviceCard from '@/components/DeviceCard';
import Modal from '@/components/Modal';
import DeviceForm from '@/components/DeviceForm';
import type { BatterySize, Device } from '@/types';

export default function Devices() {
  const navigate = useNavigate();
  const devices = useStore((s) => s.devices);
  const batteryStock = useStore((s) => s.batteryStock);
  const addDevice = useStore((s) => s.addDevice);
  const updateDevice = useStore((s) => s.updateDevice);
  const deleteDevice = useStore((s) => s.deleteDevice);
  const updateBatteryStock = useStore((s) => s.updateBatteryStock);
  const setBatteryStock = useStore((s) => s.setBatteryStock);

  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showStock, setShowStock] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredDevices = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = (data: Omit<Device, 'id' | 'createdAt'>) => {
    if (editingDevice) {
      updateDevice(editingDevice.id, data);
    } else {
      addDevice(data);
    }
    setShowForm(false);
    setEditingDevice(null);
  };

  const handleDelete = (id: string) => {
    deleteDevice(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold text-accent-blue">👂 设备管理</h2>
          <p className="text-warm-400 mt-2">
            共 {devices.length} 台助听器设备，点击卡片查看详情
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <input
              type="text"
              className="input pl-11 w-full md:w-72"
              placeholder="搜索设备名称、型号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowStock(true)} className="btn-secondary">
            <Package2 size={18} />
            电池库存
          </button>
          <button
            onClick={() => {
              setEditingDevice(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus size={18} />
            添加设备
          </button>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="card text-center py-20 animate-fade-in-up">
          <div className="text-7xl mb-6">🦻</div>
          <h3 className="text-2xl font-bold text-accent-blue mb-3">
            还没有添加助听器设备
          </h3>
          <p className="text-warm-400 mb-8 max-w-md mx-auto">
            添加您家中老人的助听器信息，我们将帮您追踪电池寿命、清洁周期和复诊提醒
          </p>
          <button
            onClick={() => {
              setEditingDevice(null);
              setShowForm(true);
            }}
            className="btn-primary text-lg px-8 py-4"
          >
            <Plus size={20} />
            添加第一台设备
          </button>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-warm-400">没有找到匹配的设备</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDevices.map((device, idx) => (
            <div
              key={device.id}
              style={{ animationDelay: `${idx * 0.05}s` }}
              className="animate-fade-in-up"
            >
              <DeviceCard
                device={device}
                onEdit={() => {
                  setEditingDevice(device);
                  setShowForm(true);
                }}
                onDelete={() => setDeleteConfirm(device.id)}
                onSelect={() => navigate(`/devices/${device.id}`)}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingDevice(null);
        }}
        title={editingDevice ? '✏️ 编辑设备信息' : '➕ 添加助听器设备'}
        subtitle={editingDevice ? '修改助听器的详细信息' : '填写设备基本信息以便追踪管理'}
        size="lg"
      >
        <DeviceForm
          device={editingDevice}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingDevice(null);
          }}
        />
      </Modal>

      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="🗑️ 删除设备"
        subtitle="删除后将同时删除所有相关记录，此操作不可撤销"
      >
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-accent-red/10 border border-accent-red/20">
            <div className="flex items-start gap-3">
              <Trash2 size={22} className="text-accent-red mt-0.5" />
              <div>
                <p className="font-bold text-accent-red">确认要删除此设备？</p>
                <p className="text-sm text-warm-500 mt-1">
                  所有相关的换电池记录、清洁记录和异常反馈都将被永久删除
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
              取消
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="btn-danger"
            >
              <Trash2 size={18} />
              确认删除
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showStock}
        onClose={() => setShowStock(false)}
        title="🔋 电池库存管理"
        subtitle="管理各规格助听器电池的库存数量"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batteryStock.map((stock) => (
              <div
                key={stock.size}
                className={`p-5 rounded-2xl border-2 ${
                  stock.quantity <= 5
                    ? 'bg-accent-red/5 border-accent-red/30'
                    : 'bg-warm-50 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-warm-400">电池规格</p>
                    <p className="text-2xl font-bold text-accent-blue">#{stock.size}号</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-warm-400">当前库存</p>
                    <p
                      className={`text-2xl font-bold ${
                        stock.quantity <= 5 ? 'text-accent-red animate-pulse-soft' : 'text-brand-600'
                      }`}
                    >
                      {stock.quantity} 颗
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateBatteryStock(stock.size as BatterySize, -1)}
                    disabled={stock.quantity === 0}
                    className="w-11 h-11 rounded-xl bg-white border-2 border-warm-100 flex items-center justify-center hover:border-warm-200 hover:bg-warm-50 disabled:opacity-40 transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={stock.quantity}
                    onChange={(e) =>
                      setBatteryStock(stock.size as BatterySize, Number(e.target.value) || 0)
                    }
                    className="input flex-1 text-center text-lg font-bold"
                  />
                  <button
                    onClick={() => updateBatteryStock(stock.size as BatterySize, 1)}
                    className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 shadow-soft transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-xs text-warm-400 mt-3">
                  {stock.quantity === 0
                    ? '⚠️ 库存为零，请尽快补货'
                    : stock.quantity <= 5
                    ? '库存偏低，建议补货'
                    : '库存充足'}
                </p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
            <p className="text-sm text-brand-700">
              💡 每次记录换电池时，系统会自动扣除对应规格电池 1 颗
            </p>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setShowStock(false)} className="btn-primary">
              完成
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

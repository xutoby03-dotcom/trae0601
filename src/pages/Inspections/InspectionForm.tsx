import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Thermometer,
  Droplets,
  Droplet,
  Volume2,
  AlertTriangle,
  Plug,
  Wind,
  FileText,
  Camera,
} from 'lucide-react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useRoomStore } from '@/store/useRoomStore';
import { useRepairStore } from '@/store/useRepairStore';
import { evaluateInspectionStatus } from '@/utils/status';
import { mockInspectors } from '@/utils/mockData';
import { cn } from '@/lib/utils';

const InspectionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get('roomId');
  const { addInspection } = useInspectionStore();
  const { rooms, setRoomStatus } = useRoomStore();
  const { addRepair } = useRepairStore();

  const [formData, setFormData] = useState({
    roomId: roomIdParam || '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '',
    waterTemperature: 45,
    waterFlowRate: 8,
    hasLeak: false,
    hasNoise: false,
    alarmCode: '',
    socketNormal: true,
    exhaustNormal: true,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewStatus, setPreviewStatus] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    const status = evaluateInspectionStatus(formData);
    setPreviewStatus(status);
  }, [formData]);

  const activeRooms = rooms.filter((r) => r.status === 'active');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.roomId) {
      newErrors.roomId = '请选择房间';
    }
    if (!formData.inspector.trim()) {
      newErrors.inspector = '请输入巡检人';
    }
    if (formData.waterTemperature <= 0) {
      newErrors.waterTemperature = '请输入有效的水温';
    }
    if (formData.waterFlowRate <= 0) {
      newErrors.waterFlowRate = '请输入有效的出水量';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const inspectionData = {
      ...formData,
      photos: [],
    };

    const newInspection = addInspection(inspectionData);

    if (newInspection.status === 'critical') {
      setRoomStatus(formData.roomId, 'maintenance');

      const room = rooms.find((r) => r.id === formData.roomId);
      addRepair({
        roomId: formData.roomId,
        sourceType: 'inspection',
        sourceId: newInspection.id,
        title: `${room?.roomNumber}房热水器异常维修`,
        description: `巡检发现异常: ${formData.notes || '请查看巡检详情'}`,
        status: 'pending',
        assignee: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        completedDate: null,
        cost: 0,
        notes: `巡检ID: ${newInspection.id}`,
      });
    }

    navigate('/inspections');
  };

  const handleToggle = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const inspectionItems = [
    {
      key: 'hasLeak',
      label: '漏水检查',
      icon: Droplet,
      description: '检查是否有漏水现象',
      dangerWhen: true,
    },
    {
      key: 'hasNoise',
      label: '异响检查',
      icon: Volume2,
      description: '运行时是否有异常响声',
      dangerWhen: true,
    },
    {
      key: 'socketNormal',
      label: '插座检查',
      icon: Plug,
      description: '电源插座是否正常',
      dangerWhen: false,
      invert: true,
    },
    {
      key: 'exhaustNormal',
      label: '排气检查',
      icon: Wind,
      description: '排气系统是否正常',
      dangerWhen: false,
      invert: true,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/inspections')}
          className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">新增巡检记录</h1>
          <p className="text-dark-400">保洁后检查热水器各项指标</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">基本信息</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                选择房间 *
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  errors.roomId
                    ? 'border-danger-500/50 focus:border-danger-500'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              >
                <option value="">请选择房间</option>
                {activeRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} 房 - {room.heaterModel}
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="text-danger-400 text-sm mt-1">{errors.roomId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                巡检日期
              </label>
              <input
                type="date"
                name="inspectionDate"
                value={formData.inspectionDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              巡检人 *
            </label>
            <select
              name="inspector"
              value={formData.inspector}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                errors.inspector
                  ? 'border-danger-500/50 focus:border-danger-500'
                  : 'border-dark-700 focus:border-warning-500/50'
              }`}
            >
              <option value="">请选择巡检人</option>
              {mockInspectors.map((inspector) => (
                <option key={inspector} value={inspector}>
                  {inspector}
                </option>
              ))}
            </select>
            {errors.inspector && (
              <p className="text-danger-400 text-sm mt-1">{errors.inspector}</p>
            )}
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">数值检测</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <Thermometer className="w-4 h-4 inline mr-1.5 text-warning-400" />
                水温 (°C)
              </label>
              <input
                type="number"
                name="waterTemperature"
                value={formData.waterTemperature}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.5"
                className={`w-full px-4 py-3 bg-dark-800/50 border rounded-xl text-white text-xl font-mono focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  formData.waterTemperature < 40 || formData.waterTemperature > 55
                    ? 'border-danger-500/50'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              />
              <p className="text-xs text-dark-500 mt-1">正常范围: 40-55°C</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <Droplets className="w-4 h-4 inline mr-1.5 text-primary-400" />
                出水量 (L/min)
              </label>
              <input
                type="number"
                name="waterFlowRate"
                value={formData.waterFlowRate}
                onChange={handleChange}
                min="0"
                max="30"
                step="0.5"
                className={`w-full px-4 py-3 bg-dark-800/50 border rounded-xl text-white text-xl font-mono focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  formData.waterFlowRate < 6
                    ? 'border-warning-500/50'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              />
              <p className="text-xs text-dark-500 mt-1">正常: ≥ 6L/min</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">检查项目</h2>

          <div className="grid grid-cols-2 gap-4">
            {inspectionItems.map((item) => {
              const Icon = item.icon;
              const value = formData[item.key as keyof typeof formData] as boolean;
              const isDanger = item.invert ? !value : value;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggle(item.key as keyof typeof formData)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    isDanger
                      ? 'bg-danger-500/10 border-danger-500/50'
                      : 'bg-dark-800/30 border-dark-700 hover:border-dark-600'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isDanger ? 'bg-danger-500/20' : 'bg-dark-700/50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isDanger ? 'text-danger-400' : 'text-dark-400'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            'font-medium',
                            isDanger ? 'text-danger-400' : 'text-white'
                          )}
                        >
                          {item.label}
                        </p>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isDanger ? 'text-danger-400' : 'text-success-400'
                          )}
                        >
                          {isDanger ? '异常' : '正常'}
                        </span>
                      </div>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-1.5 text-warning-400" />
              报警码
            </label>
            <input
              type="text"
              name="alarmCode"
              value={formData.alarmCode}
              onChange={handleChange}
              placeholder="无报警码请留空，如 E1、E3 等"
              className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                formData.alarmCode
                  ? 'border-danger-500/50'
                  : 'border-dark-700 focus:border-warning-500/50'
              }`}
            />
            <p className="text-xs text-dark-500 mt-1">
              如有显示故障代码请填写
            </p>
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">
            <FileText className="w-5 h-5 inline mr-2 text-dark-400" />
            备注说明
          </h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="请输入巡检备注，如有异常请详细描述..."
            className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all resize-none"
          />
        </div>

        <div
          className={cn(
            'p-4 rounded-xl border-2',
            previewStatus === 'normal'
              ? 'bg-success-500/10 border-success-500/30'
              : previewStatus === 'warning'
              ? 'bg-warning-500/10 border-warning-500/30'
              : 'bg-danger-500/10 border-danger-500/30'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  previewStatus === 'normal'
                    ? 'bg-success-500/20'
                    : previewStatus === 'warning'
                    ? 'bg-warning-500/20'
                    : 'bg-danger-500/20'
                )}
              >
                {previewStatus === 'normal' ? (
                  <span className="text-success-400 text-xl">✓</span>
                ) : (
                  <AlertTriangle
                    className={cn(
                      'w-5 h-5',
                      previewStatus === 'warning' ? 'text-warning-400' : 'text-danger-400'
                    )}
                  />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    'font-semibold',
                    previewStatus === 'normal'
                      ? 'text-success-400'
                      : previewStatus === 'warning'
                      ? 'text-warning-400'
                      : 'text-danger-400'
                  )}
                >
                  巡检结果预览:{' '}
                  {previewStatus === 'normal'
                    ? '正常'
                    : previewStatus === 'warning'
                    ? '警告'
                    : '严重异常'}
                </p>
                <p className="text-sm text-dark-400">
                  {previewStatus === 'normal'
                    ? '设备运行正常，无需处理'
                    : previewStatus === 'warning'
                    ? '建议关注，可继续观察'
                    : '系统将自动暂停房间上架并生成维修工单'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/inspections"
            className="px-5 py-2.5 bg-dark-800 text-white rounded-xl font-medium hover:bg-dark-700 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            提交巡检
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm;

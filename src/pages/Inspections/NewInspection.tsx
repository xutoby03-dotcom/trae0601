import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  QrCode,
  Gauge,
  Lock,
  Wind,
  DoorOpen,
  Package,
  User,
  AlertTriangle,
  X,
  Search,
  Check,
  Camera
} from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useRectificationStore } from '@/store/rectificationStore';
import { PressureStatus, InspectionResult, RectificationType } from '@/types';
import { formatDate } from '@/utils/date';

export function NewInspection() {
  const navigate = useNavigate();
  const { addInspection } = useInspectionStore();
  const { devices, getDeviceById } = useDeviceStore();
  const { addRectification } = useRectificationStore();

  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [pressure, setPressure] = useState<number>(0);
  const [seal, setSeal] = useState(true);
  const [hose, setHose] = useState(true);
  const [boxDoor, setBoxDoor] = useState(true);
  const [obstruction, setObstruction] = useState(false);
  const [inspector, setInspector] = useState('');
  const [remark, setRemark] = useState('');
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [searchDevice, setSearchDevice] = useState('');
  const [scannerMode, setScannerMode] = useState<'input' | 'list'>('input');
  const [inputCode, setInputCode] = useState('');
  const [scanAnimation, setScanAnimation] = useState(false);

  const selectedDevice = selectedDeviceId ? getDeviceById(selectedDeviceId) : null;

  const getPressureStatus = (): PressureStatus => {
    if (!selectedDevice) return 'normal';
    if (pressure < selectedDevice.minPressure) return 'low';
    if (pressure > selectedDevice.maxPressure) return 'high';
    return 'normal';
  };

  const getResult = (): InspectionResult => {
    const pressureStatus = getPressureStatus();
    if (pressureStatus !== 'normal') return 'abnormal';
    if (!seal || !hose || !boxDoor || obstruction) return 'abnormal';
    return 'normal';
  };

  const hasAbnormal = getResult() === 'abnormal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId || !inspector.trim()) {
      alert('请选择设备并填写检查人');
      return;
    }

    const pressureStatus = getPressureStatus();
    const result = getResult();

    const newInspection = addInspection({
      deviceId: selectedDeviceId,
      inspectDate: formatDate(new Date().toISOString()),
      inspector: inspector.trim(),
      pressure,
      pressureStatus,
      seal,
      hose,
      boxDoor,
      obstruction,
      result,
      remark: remark.trim()
    });

    if (result === 'abnormal') {
      const issues: string[] = [];
      const types: RectificationType[] = [];

      if (pressureStatus !== 'normal') {
        issues.push(`压力${pressureStatus === 'low' ? '偏低' : '偏高'}（${pressure}MPa）`);
        types.push('pressure');
      }
      if (!seal) issues.push('铅封损坏');
      if (!hose) issues.push('喷管损坏');
      if (!boxDoor) issues.push('箱门变形');
      if (obstruction) {
        issues.push('有杂物遮挡');
        types.push('obstruction');
      }

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);

      addRectification({
        deviceId: selectedDeviceId,
        inspectionId: newInspection.id,
        type: types[0] || 'other',
        description: issues.join('；'),
        status: 'pending',
        deadline: formatDate(deadline.toISOString()),
        handler: '待分配'
      });
    }

    alert(hasAbnormal ? '巡检记录已提交，已生成整改单' : '巡检记录已提交');
    navigate('/inspections');
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d =>
      d.code.toLowerCase().includes(searchDevice.toLowerCase()) ||
      d.location.toLowerCase().includes(searchDevice.toLowerCase())
    );
  }, [devices, searchDevice]);

  const handleScanCode = () => {
    setScanAnimation(true);
    setTimeout(() => {
      setScanAnimation(false);
      if (inputCode.trim()) {
        const found = devices.find(d =>
          d.code.toLowerCase() === inputCode.trim().toLowerCase()
        );
        if (found) {
          setSelectedDeviceId(found.id);
          setShowDevicePicker(false);
          setInputCode('');
          setSearchDevice('');
        } else {
          alert(`未找到设备编号: ${inputCode}`);
        }
      } else {
        alert('请输入设备编号');
      }
    }, 800);
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setShowDevicePicker(false);
    setInputCode('');
    setSearchDevice('');
  };

  const simulateScan = () => {
    setScanAnimation(true);
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    setTimeout(() => {
      setInputCode(randomDevice.code);
      setScanAnimation(false);
    }, 1000);
  };

  const toggleItem = (
    value: boolean,
    setter: (v: boolean) => void,
    isPositive = true
  ) => {
    setter(isPositive ? !value : !value);
  };

  const CheckItem = ({
    icon: Icon,
    label,
    value,
    onChange,
    isPositive = true
  }: {
    icon: any;
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    isPositive?: boolean;
  }) => {
    const isGood = isPositive ? value : !value;
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
          isGood
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}
      >
        <Icon className="h-6 w-6" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs">
          {isGood ? '正常' : '异常'}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/inspections')}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">新建巡检</h2>
          <p className="text-sm text-gray-500">扫码或选择设备进行巡检登记</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">选择设备</h3>
            
            {selectedDevice ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={selectedDevice.photo}
                    alt={selectedDevice.code}
                    className="h-32 w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedDevice.code}</p>
                  <p className="text-sm text-gray-500">{selectedDevice.type}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedDevice.building} {selectedDevice.floor} {selectedDevice.location}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">标准压力范围</p>
                  <p className="font-medium text-gray-900">
                    {selectedDevice.minPressure} - {selectedDevice.maxPressure} MPa
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeviceId('');
                    setPressure(0);
                  }}
                  className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  更换设备
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDevicePicker(true);
                    setScannerMode('input');
                    setInputCode('');
                  }}
                  className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-8 text-gray-500 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all"
                >
                  <QrCode className="h-10 w-10" />
                  <span className="text-sm font-medium">扫码选择设备</span>
                </button>

                <div className="text-center text-sm text-gray-400">或</div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索设备编号或位置..."
                    value={searchDevice}
                    onChange={e => setSearchDevice(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                {searchDevice && (
                  <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-100">
                    {filteredDevices.map(device => (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => handleSelectDevice(device.id)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{device.code}</p>
                          <p className="text-xs text-gray-500">
                            {device.building} {device.floor} {device.location}
                          </p>
                        </div>
                        <img
                          src={device.photo}
                          alt=""
                          className="h-8 w-8 rounded object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {hasAbnormal && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">检测到异常</p>
                  <p className="text-sm text-amber-700">
                    提交后将自动生成整改单
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 font-semibold text-gray-900">检查项目</h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Gauge className="h-4 w-4 text-gray-400" />
                  压力值 (MPa)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={pressure || ''}
                    onChange={e => setPressure(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    placeholder="输入压力值"
                    disabled={!selectedDeviceId}
                    className="w-40 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                  />
                  {selectedDevice && pressure > 0 && (
                    <div className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      getPressureStatus() === 'normal'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {getPressureStatus() === 'normal' ? '压力正常' :
                       getPressureStatus() === 'low' ? '压力偏低' : '压力偏高'}
                    </div>
                  )}
                  {selectedDevice && (
                    <span className="text-xs text-gray-500">
                      标准范围: {selectedDevice.minPressure}-{selectedDevice.maxPressure} MPa
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  外观检查
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <CheckItem
                    icon={Lock}
                    label="铅封"
                    value={seal}
                    onChange={setSeal}
                  />
                  <CheckItem
                    icon={Wind}
                    label="喷管"
                    value={hose}
                    onChange={setHose}
                  />
                  <CheckItem
                    icon={DoorOpen}
                    label="箱门"
                    value={boxDoor}
                    onChange={setBoxDoor}
                  />
                  <CheckItem
                    icon={Package}
                    label="遮挡物"
                    value={obstruction}
                    onChange={setObstruction}
                    isPositive={false}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  检查人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inspector}
                  onChange={e => setInspector(e.target.value)}
                  placeholder="请输入检查人姓名"
                  className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="如有其他情况请在此说明..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => navigate('/inspections')}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!selectedDeviceId || !inspector.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Save className="h-4 w-4" />
                提交巡检
              </button>
            </div>
          </div>
        </div>
      </form>

      {showDevicePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">扫码选择设备</h3>
              <button
                type="button"
                onClick={() => setShowDevicePicker(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => setScannerMode('input')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  scannerMode === 'input'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                扫码/输入编号
              </button>
              <button
                type="button"
                onClick={() => setScannerMode('list')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  scannerMode === 'list'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                从列表选择
              </button>
            </div>

            <div className="p-6">
              {scannerMode === 'input' ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className={`relative mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-4 border-dashed transition-colors ${
                      scanAnimation ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}>
                      {scanAnimation ? (
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          <div className="absolute inset-x-0 h-1 bg-red-500/50 animate-pulse" style={{
                            animation: 'scan 1s ease-in-out infinite'
                          }} />
                        </div>
                      ) : null}
                      <QrCode className={`h-16 w-16 transition-colors ${
                        scanAnimation ? 'text-red-400' : 'text-gray-300'
                      }`} />
                      {scanAnimation && (
                        <div className="absolute bottom-3 text-sm text-red-500 font-medium">
                          正在识别...
                        </div>
                      )}
                    </div>
                    <style>{`
                      @keyframes scan {
                        0%, 100% { top: 0; }
                        50% { top: calc(100% - 4px); }
                      }
                    `}</style>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      设备编号
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={e => setInputCode(e.target.value)}
                        placeholder="输入或扫描设备编号"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        onKeyDown={e => e.key === 'Enter' && handleScanCode()}
                      />
                      <button
                        type="button"
                        onClick={simulateScan}
                        disabled={scanAnimation}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Camera className="h-4 w-4" />
                        模拟扫码
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleScanCode}
                    disabled={scanAnimation || !inputCode.trim()}
                    className="w-full rounded-lg bg-red-600 py-3 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {scanAnimation ? '识别中...' : '确认设备'}
                  </button>

                  {inputCode && !scanAnimation && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">可用设备编号示例：</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {devices.slice(0, 6).map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setInputCode(d.code)}
                            className="rounded bg-white px-2 py-0.5 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600"
                          >
                            {d.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索设备编号或位置..."
                      value={searchDevice}
                      onChange={e => setSearchDevice(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {(searchDevice ? filteredDevices : devices).map(device => (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => handleSelectDevice(device.id)}
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition-all hover:border-red-200 hover:bg-red-50/50"
                      >
                        <img
                          src={device.photo}
                          alt=""
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{device.code}</p>
                          <p className="text-xs text-gray-500">
                            {device.building} {device.floor} {device.location}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {device.type} · 压力 {device.minPressure}-{device.maxPressure} MPa
                          </p>
                        </div>
                        <Check className="h-5 w-5 text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

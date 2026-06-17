import { Link, useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, ArrowLeft, Save, CheckCircle, 
  AlertTriangle, Car, Armchair, ChevronDown 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useSeatStore } from '@/store/useSeatStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useTaskStore } from '@/store/useTaskStore';
import InspectionCheckItem from '@/components/common/InspectionCheckItem';
import { 
  INSPECTION_ITEMS, InspectionItemKey, Installation,
  ORIENTATION_LABELS, INSTALLATION_TYPE_LABELS
} from '@/types';
import { formatDate } from '@/utils/date';

export default function InspectionPage() {
  const navigate = useNavigate();
  const { vehicles } = useVehicleStore();
  const { seats } = useSeatStore();
  const { installations, addInstallation, updateInstallation } = useInstallationStore();
  const { inspections, addInspection, getInspectionsByInstallationId, createEmptyInspection } = useInspectionStore();
  const { generateTasksFromFailedInspection } = useTaskStore();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedSeatId, setSelectedSeatId] = useState<string>('');
  const [installationData, setInstallationData] = useState({
    orientation: 'backward' as 'forward' | 'backward',
    installationMethod: 'isofix' as 'seatbelt' | 'isofix',
  });
  const [manualPage, setManualPage] = useState('');
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [currentInstallation, setCurrentInstallation] = useState<Installation | null>(null);
  const [inspection, setInspection] = useState<ReturnType<typeof createEmptyInspection> | null>(null);

  useEffect(() => {
    if (selectedVehicleId && selectedSeatId) {
      let installation = installations.find(
        i => i.vehicleId === selectedVehicleId && i.seatId === selectedSeatId
      );

      if (installation) {
        setCurrentInstallation(installation);
        setInstallationData({
          orientation: installation.orientation,
          installationMethod: installation.installationMethod,
        });
      } else {
        setCurrentInstallation(null);
      }

      if (installation) {
        const newInspection = createEmptyInspection(installation.id);
        const lastInspection = getInspectionsByInstallationId(installation.id)[0];
        if (lastInspection) {
          setManualPage(lastInspection.manualPage || '');
        }
        setInspection(newInspection);
      } else {
        setInspection(null);
      }
    } else {
      setCurrentInstallation(null);
      setInspection(null);
    }
  }, [selectedVehicleId, selectedSeatId, installations]);

  const handleItemChange = (key: InspectionItemKey, checked: boolean, itemNotes?: string) => {
    if (!inspection) return;
    setInspection({
      ...inspection,
      [key]: {
        ...inspection[key],
        checked,
        notes: itemNotes,
      },
    });
  };

  const allChecked = inspection ? INSPECTION_ITEMS.every(item => inspection[item.key].checked) : false;
  const passedCount = inspection ? INSPECTION_ITEMS.filter(item => inspection[item.key].checked).length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspection || !currentInstallation) return;

    const finalInspection = {
      ...inspection,
      manualPage,
      notes,
      passed: allChecked,
      date: new Date().toISOString().split('T')[0],
    };

    addInspection(finalInspection);

    updateInstallation(currentInstallation.id, {
      ...installationData,
      lastInspectionDate: new Date().toISOString().split('T')[0],
    });

    if (!allChecked) {
      const failedItems = INSPECTION_ITEMS.filter(item => !inspection[item.key].checked).map(item => ({
        key: item.key,
        label: item.label,
        instruction: item.instruction,
        notes: inspection[item.key].notes,
      }));
      generateTasksFromFailedInspection(finalInspection.id, failedItems, manualPage);
    }

    navigate('/inspection/quick', { state: { inspectionId: finalInspection.id } });
  };

  const handleSaveInstallation = () => {
    if (!selectedVehicleId || !selectedSeatId) return;

    if (currentInstallation) {
      updateInstallation(currentInstallation.id, installationData);
    } else {
      addInstallation({
        vehicleId: selectedVehicleId,
        seatId: selectedSeatId,
        ...installationData,
      });
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedSeat = seats.find(s => s.id === selectedSeatId);
  const historyInspections = currentInstallation 
    ? getInspectionsByInstallationId(currentInstallation.id).slice(0, 5)
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">安装检查</h1>
          <p className="text-gray-500 mt-1">
            按照标准化流程检查安全座椅安装状态
          </p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Car className="w-5 h-5 text-primary-500" />
          选择车辆和座椅
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">选择车辆</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="input"
            >
              <option value="">请选择车辆</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} ({vehicle.plateNumber})
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <Link to="/vehicles/new" className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block">
                + 新增车辆
              </Link>
            )}
          </div>

          <div>
            <label className="label">选择座椅</label>
            <select
              value={selectedSeatId}
              onChange={(e) => setSelectedSeatId(e.target.value)}
              className="input"
            >
              <option value="">请选择座椅</option>
              {seats.map(seat => (
                <option key={seat.id} value={seat.id}>
                  {seat.brand} {seat.model} ({seat.weightRange})
                </option>
              ))}
            </select>
            {seats.length === 0 && (
              <Link to="/seats/new" className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block">
                + 新增座椅
              </Link>
            )}
          </div>
        </div>
      </div>

      {selectedVehicle && selectedSeat && (
        <>
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Armchair className="w-5 h-5 text-primary-500" />
              安装信息
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">安装朝向</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ORIENTATION_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setInstallationData(prev => ({ ...prev, orientation: value as any }));
                        if (currentInstallation) handleSaveInstallation();
                      }}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        installationData.orientation === value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">固定方式</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['seatbelt', 'isofix'] as const).map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setInstallationData(prev => ({ ...prev, installationMethod: value }));
                        if (currentInstallation) handleSaveInstallation();
                      }}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        installationData.installationMethod === value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {value === 'seatbelt' ? '安全带' : 'ISOFIX'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!currentInstallation && (
              <button
                type="button"
                onClick={handleSaveInstallation}
                className="btn-secondary w-full"
              >
                保存安装配置
              </button>
            )}
          </div>

          {inspection && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-primary-500" />
                    检查项目 ({passedCount}/{INSPECTION_ITEMS.length} 项通过)
                  </h2>
                  <div className={`badge ${allChecked ? 'badge-success' : 'badge-warning'}`}>
                    {allChecked ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> 全部通过</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3 mr-1" /> 待检查</>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {INSPECTION_ITEMS.map((item, index) => (
                    <div key={item.key} style={{ animationDelay: `${index * 50}ms` }}>
                      <InspectionCheckItem
                        config={item}
                        item={inspection[item.key]}
                        onChange={(checked, notes) => handleItemChange(item.key, checked, notes)}
                        manualPage={manualPage}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">检查备注</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">说明书页码</label>
                    <input
                      type="text"
                      value={manualPage}
                      onChange={(e) => setManualPage(e.target.value)}
                      placeholder="例如：15"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">检查备注</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="记录本次检查的其他情况..."
                    className="input resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {historyInspections.length > 0 && (
                <div className="card p-6 space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      历史检查记录
                    </h3>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showHistory && (
                    <div className="space-y-3 animate-fade-in-up">
                      {historyInspections.map((hist) => (
                        <div key={hist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hist.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                              {hist.passed 
                                ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                                : <AlertTriangle className="w-4 h-4 text-red-600" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(hist.date)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {INSPECTION_ITEMS.filter(item => hist[item.key].checked).length}/{INSPECTION_ITEMS.length} 项通过
                              </p>
                            </div>
                          </div>
                          <span className={`badge ${hist.passed ? 'badge-success' : 'badge-danger'}`}>
                            {hist.passed ? '通过' : '未通过'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Link to="/" className="btn-outline flex-1">
                  取消
                </Link>
                <button type="submit" className="btn-primary flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  提交检查
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

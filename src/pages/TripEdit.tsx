import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  User,
  Car,
  Gauge,
  Camera,
  Plus,
  X,
  Baby,
  Clock,
  Save,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import PageLayout from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import { handleImageUpload } from '@/utils/image';

export default function TripEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const getTrip = useTripStore(state => state.getTrip);
  const addTrip = useTripStore(state => state.addTrip);
  const updateTrip = useTripStore(state => state.updateTrip);
  const addPassenger = useTripStore(state => state.addPassenger);
  const updatePassenger = useTripStore(state => state.updatePassenger);
  const deletePassenger = useTripStore(state => state.deletePassenger);
  const updateSettings = useTripStore(state => state.updateSettings);

  const existingTrip = isEdit ? getTrip(id!) : undefined;

  const [formData, setFormData] = useState({
    destination: '',
    departureTime: '',
    driverName: '',
    vehicleInfo: '',
    kilometers: '',
    photoUrl: '',
  });

  const [newPassengerName, setNewPassengerName] = useState('');
  const [showAddPassenger, setShowAddPassenger] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleImageUpload(e);
    if (result) {
      setFormData(prev => ({ ...prev, photoUrl: result }));
    }
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  useEffect(() => {
    if (existingTrip) {
      const date = new Date(existingTrip.departureTime);
      const datetimeLocal = date.toISOString().slice(0, 16);
      setFormData({
        destination: existingTrip.destination,
        departureTime: datetimeLocal,
        driverName: existingTrip.driverName,
        vehicleInfo: existingTrip.vehicleInfo,
        kilometers: existingTrip.kilometers.toString(),
        photoUrl: existingTrip.photoUrl || '',
      });
    } else {
      const now = new Date();
      now.setHours(8, 0, 0, 0);
      setFormData(prev => ({
        ...prev,
        departureTime: now.toISOString().slice(0, 16),
      }));
    }
  }, [existingTrip]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.destination.trim()) {
      alert('请输入目的地');
      return;
    }
    if (!formData.driverName.trim()) {
      alert('请输入司机姓名');
      return;
    }

    const tripData = {
      destination: formData.destination,
      departureTime: new Date(formData.departureTime).toISOString(),
      driverName: formData.driverName,
      vehicleInfo: formData.vehicleInfo,
      kilometers: parseFloat(formData.kilometers) || 0,
      photoUrl: formData.photoUrl,
    };

    if (isEdit && existingTrip) {
      updateTrip(id!, tripData);
      navigate(-1);
    } else {
      const tripId = addTrip(tripData);
      navigate(`/trip/${tripId}`);
    }
  };

  const handleAddPassenger = () => {
    if (!newPassengerName.trim()) return;
    if (isEdit) {
      addPassenger(id!, {
        name: newPassengerName.trim(),
        isChild: false,
        isHalfWay: false,
      });
    }
    setNewPassengerName('');
    setShowAddPassenger(false);
  };

  const handleToggleChild = (passengerId: string, current: boolean) => {
    if (isEdit) {
      updatePassenger(id!, passengerId, { isChild: !current });
    }
  };

  const handleToggleHalfWay = (passengerId: string, current: boolean) => {
    if (isEdit) {
      updatePassenger(id!, passengerId, { isHalfWay: !current });
    }
  };

  const handleDeletePassenger = (passengerId: string) => {
    if (isEdit) {
      if (confirm('确定删除这位乘客吗？')) {
        deletePassenger(id!, passengerId);
      }
    }
  };

  const passengers = existingTrip?.passengers || [];
  const settings = existingTrip?.settings;

  return (
    <PageLayout
      title={isEdit ? '编辑行程' : '新建行程'}
      showBack
      rightAction={
        <button
          onClick={handleSave}
          className="text-teal-600 font-medium text-sm flex items-center gap-1"
        >
          <Save size={16} />
          保存
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-orange-500" />
            行程档案
          </h2>

          <div className="space-y-4">
            <FormInput
              icon={<MapPin size={18} />}
              label="目的地"
              value={formData.destination}
              onChange={v => handleInputChange('destination', v)}
              placeholder="例如：杭州西湖"
            />

            <FormInput
              icon={<Calendar size={18} />}
              label="出发时间"
              type="datetime-local"
              value={formData.departureTime}
              onChange={v => handleInputChange('departureTime', v)}
            />

            <FormInput
              icon={<User size={18} />}
              label="司机"
              value={formData.driverName}
              onChange={v => handleInputChange('driverName', v)}
              placeholder="输入司机姓名"
            />

            <FormInput
              icon={<Car size={18} />}
              label="车辆信息"
              value={formData.vehicleInfo}
              onChange={v => handleInputChange('vehicleInfo', v)}
              placeholder="例如：特斯拉 Model Y"
            />

            <FormInput
              icon={<Gauge size={18} />}
              label="公里数"
              type="number"
              value={formData.kilometers}
              onChange={v => handleInputChange('kilometers', v)}
              placeholder="0"
              suffix="km"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Camera size={18} className="text-orange-500" />
            行程合照
          </h2>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {formData.photoUrl ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={formData.photoUrl}
                alt="行程合照"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/90 text-stone-700 rounded-lg text-sm font-medium"
                >
                  重新上传
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-sm font-medium"
                >
                  删除
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => photoInputRef.current?.click()}
              className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 cursor-pointer hover:bg-stone-50 hover:border-teal-300 transition-colors"
            >
              <div className="text-center">
                <Camera size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">点击上传合照</p>
                <p className="text-xs text-stone-400 mt-1">支持 JPG、PNG 格式</p>
              </div>
            </div>
          )}
        </div>

        {isEdit && (
          <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
                  <User size={18} className="text-orange-500" />
                  乘客列表
                  <span className="text-sm font-normal text-stone-400">
                    ({passengers.length}人)
                  </span>
                </h2>
                <button
                  onClick={() => setShowAddPassenger(true)}
                  className="text-teal-600 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>

              {showAddPassenger && (
                <div className="mb-4 p-3 bg-amber-50 rounded-xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPassengerName}
                      onChange={e => setNewPassengerName(e.target.value)}
                      placeholder="输入乘客姓名"
                      className="flex-1 px-3 py-2 rounded-lg border border-amber-200 text-sm focus:outline-none focus:border-teal-400"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleAddPassenger()}
                    />
                    <button
                      onClick={handleAddPassenger}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => setShowAddPassenger(false)}
                      className="p-2 text-stone-400 hover:text-stone-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              {passengers.length === 0 ? (
                <p className="text-center text-stone-400 py-6 text-sm">
                  暂无乘客，点击右上角添加
                </p>
              ) : (
                <div className="space-y-2">
                  {passengers.map(passenger => (
                    <div
                      key={passenger.id}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                          {passenger.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">
                            {passenger.name}
                            {passenger.name === existingTrip?.driverName && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                司机
                              </span>
                            )}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <TagButton
                              active={passenger.isChild}
                              onClick={() => handleToggleChild(passenger.id, passenger.isChild)}
                              icon={<Baby size={12} />}
                              label="儿童免摊"
                              activeColor="pink"
                            />
                            <TagButton
                              active={passenger.isHalfWay}
                              onClick={() => handleToggleHalfWay(passenger.id, passenger.isHalfWay)}
                              icon={<Clock size={12} />}
                              label="半程上车"
                              activeColor="amber"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePassenger(passenger.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Car size={18} className="text-orange-500" />
                司机补贴
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-stone-700">启用司机补贴</span>
                  <div
                    onClick={() =>
                      updateSettings(id!, { hasDriverSubsidy: !settings?.hasDriverSubsidy })
                    }
                    className={cn(
                      'w-12 h-7 rounded-full transition-colors relative cursor-pointer',
                      settings?.hasDriverSubsidy ? 'bg-teal-500' : 'bg-stone-300'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        settings?.hasDriverSubsidy ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </div>
                </label>

                {settings?.hasDriverSubsidy && (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateSettings(id!, { driverSubsidyType: 'fixed' })}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                          settings.driverSubsidyType === 'fixed'
                            ? 'bg-teal-500 text-white'
                            : 'bg-stone-100 text-stone-600'
                        )}
                      >
                        固定金额
                      </button>
                      <button
                        onClick={() => updateSettings(id!, { driverSubsidyType: 'percentage' })}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                          settings.driverSubsidyType === 'percentage'
                            ? 'bg-teal-500 text-white'
                            : 'bg-stone-100 text-stone-600'
                        )}
                      >
                        油费比例
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={settings.driverSubsidyAmount || ''}
                        onChange={e =>
                          updateSettings(id!, {
                            driverSubsidyAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-teal-400',
                          'border-stone-200'
                        )}
                        placeholder={
                          settings.driverSubsidyType === 'fixed' ? '补贴金额' : '百分比'
                        }
                      />
                      <span className="text-stone-500 text-sm">
                        {settings.driverSubsidyType === 'fixed' ? '元' : '%'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Baby size={18} className="text-orange-500" />
                分摊设置
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-stone-700">儿童免摊</span>
                    <p className="text-xs text-stone-400 mt-0.5">开启后儿童不参与费用分摊</p>
                  </div>
                  <div
                    onClick={() =>
                      updateSettings(id!, { childFree: !settings?.childFree })
                    }
                    className={cn(
                      'w-12 h-7 rounded-full transition-colors relative cursor-pointer',
                      settings?.childFree ? 'bg-teal-500' : 'bg-stone-300'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        settings?.childFree ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </div>
                </label>

                <div>
                  <label className="text-stone-700 text-sm block mb-2">
                    半程上车分摊比例
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings?.halfWayRatio || 0.5}
                      onChange={e =>
                        updateSettings(id!, { halfWayRatio: parseFloat(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-teal-600 font-bold w-12 text-right">
                      {Math.round((settings?.halfWayRatio || 0.5) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}

function FormInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-sm text-stone-500 mb-1.5 block flex items-center gap-2">
        <span className="text-teal-500">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:border-teal-400 focus:bg-white transition-colors"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function TagButton({
  active,
  onClick,
  icon,
  label,
  activeColor = 'teal',
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeColor?: 'teal' | 'pink' | 'amber';
}) {
  const colorClasses = {
    teal: active ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-stone-400',
    pink: active ? 'bg-pink-100 text-pink-600' : 'bg-stone-100 text-stone-400',
    amber: active ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
        colorClasses[activeColor]
      )}
    >
      {icon}
      {label}
    </button>
  );
}

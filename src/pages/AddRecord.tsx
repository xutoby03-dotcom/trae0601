import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CLOTHING_TYPES, AREAS, FAMILY_MEMBERS, EXPECTED_DURATION_OPTIONS } from '../data/constants';
import { ClothingType } from '../types';
import { ArrowLeft, Check, Shirt, MapPin, User, Clock, Sun, Camera, Plus, Minus } from 'lucide-react';

const AddRecord: React.FC = () => {
  const navigate = useNavigate();
  const { addRecord } = useStore();

  const [formData, setFormData] = useState({
    clothingType: 'top' as ClothingType,
    quantity: 1,
    locationId: AREAS[0].id,
    responsiblePersonId: FAMILY_MEMBERS[0].id,
    expectedDuration: 4,
    isThick: false,
    photoUrl: ''
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const selectedClothingType = CLOTHING_TYPES.find(t => t.value === formData.clothingType)!;
  const selectedLocation = AREAS.find(a => a.id === formData.locationId)!;
  const selectedPerson = FAMILY_MEMBERS.find(m => m.id === formData.responsiblePersonId)!;

  const handleSubmit = () => {
    addRecord({
      clothingType: formData.clothingType,
      clothingTypeLabel: selectedClothingType.label,
      clothingTypeIcon: selectedClothingType.icon,
      quantity: formData.quantity,
      location: selectedLocation.name,
      locationId: formData.locationId,
      responsiblePerson: selectedPerson.name,
      responsiblePersonId: formData.responsiblePersonId,
      responsiblePersonAvatar: selectedPerson.avatar,
      startTime: new Date().toISOString(),
      expectedDuration: formData.expectedDuration,
      isThick: formData.isThick,
      photoUrl: formData.photoUrl || undefined,
    });

    navigate('/');
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            s === step 
              ? 'bg-sky-500 text-white scale-110' 
              : s < step 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {s < step ? <Check size={16} /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 mx-1 rounded transition-all ${
              s < step ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Shirt size={20} className="text-sky-500" />
          选择衣物类型
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {CLOTHING_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setFormData({ ...formData, clothingType: type.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.clothingType === type.value
                  ? 'border-sky-500 bg-sky-50 scale-105 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/50'
              }`}
            >
              <div className="text-3xl mb-2 animate-float" style={{ animationDelay: `${Math.random()}s` }}>
                {type.icon}
              </div>
              <div className="text-sm font-medium text-gray-700">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          数量
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
          >
            <Minus size={24} />
          </button>
          <div className="w-20 text-center">
            <span className="text-4xl font-bold text-sky-600">{formData.quantity}</span>
            <span className="text-gray-500 ml-1">件</span>
          </div>
          <button
            onClick={() => setFormData({ ...formData, quantity: Math.min(20, formData.quantity + 1) })}
            className="w-12 h-12 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-all"
          >
            <Plus size={24} className="text-sky-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <label className="flex items-center gap-3 cursor-pointer flex-1">
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            formData.isThick ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
          }`}>
            {formData.isThick && <Check size={16} className="text-white" />}
          </div>
          <input
            type="checkbox"
            checked={formData.isThick}
            onChange={(e) => setFormData({ ...formData, isThick: e.target.checked })}
            className="hidden"
          />
          <div>
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <span className="text-xl">🧥</span>
              厚衣物
            </div>
            <p className="text-sm text-gray-500">如毛衣、外套、牛仔裤等需要更长晾晒时间</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <MapPin size={20} className="text-sky-500" />
          选择晾晒位置
        </label>
        <div className="space-y-3">
          {AREAS.map(area => (
            <button
              key={area.id}
              onClick={() => setFormData({ ...formData, locationId: area.id })}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                formData.locationId === area.id
                  ? 'border-sky-500 bg-sky-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-sky-300'
              }`}
              style={{
                background: formData.locationId === area.id
                  ? `linear-gradient(135deg, ${area.gradientStart}88 0%, ${area.gradientEnd}88 100%)`
                  : undefined
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{area.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{area.name}</div>
                  <div className="text-sm text-gray-500">{area.description}</div>
                </div>
                {formData.locationId === area.id && (
                  <Check size={20} className="ml-auto text-sky-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <User size={20} className="text-sky-500" />
          负责人
        </label>
        <div className="flex flex-wrap gap-3">
          {FAMILY_MEMBERS.map(member => (
            <button
              key={member.id}
              onClick={() => setFormData({ ...formData, responsiblePersonId: member.id })}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                formData.responsiblePersonId === member.id
                  ? 'border-sky-500 bg-sky-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-sky-300'
              }`}
              style={{
                borderColor: formData.responsiblePersonId === member.id ? member.color : undefined
              }}
            >
              <span className="text-2xl">{member.avatar}</span>
              <span className="font-medium" style={{ color: formData.responsiblePersonId === member.id ? member.color : undefined }}>
                {member.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Clock size={20} className="text-sky-500" />
          预计晾晒时长
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPECTED_DURATION_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, expectedDuration: option.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.expectedDuration === option.value
                  ? 'border-sky-500 bg-sky-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-sky-300'
              }`}
            >
              <div className="text-2xl font-bold text-sky-600">{option.value}h</div>
              <div className="text-xs text-gray-500 mt-1">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Camera size={20} className="text-sky-500" />
          照片（可选）
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-sky-400 transition-all">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-gray-500 mb-2">点击上传照片</p>
          <p className="text-xs text-gray-400">记录衣物状态，方便后续对比</p>
          <input
            type="text"
            placeholder="或输入图片URL"
            value={formData.photoUrl}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            className="input-field mt-4 max-w-md mx-auto"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sun size={20} className="text-amber-500" />
          确认信息
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">衣物：</span>
            <span className="font-medium">{selectedClothingType.icon} {selectedClothingType.label} × {formData.quantity}</span>
          </div>
          <div>
            <span className="text-gray-500">位置：</span>
            <span className="font-medium">{selectedLocation.icon} {selectedLocation.name}</span>
          </div>
          <div>
            <span className="text-gray-500">负责人：</span>
            <span className="font-medium">{selectedPerson.avatar} {selectedPerson.name}</span>
          </div>
          <div>
            <span className="text-gray-500">预计时长：</span>
            <span className="font-medium">{formData.expectedDuration} 小时</span>
          </div>
          {formData.isThick && (
            <div className="col-span-2">
              <span className="chip-warm">🧥 厚衣物</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 pb-24 md:pb-8 md:pt-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/50 transition-all"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold font-display text-gray-800">
            添加晾晒记录
          </h1>
        </div>

        {renderStepIndicator()}

        <div className="card p-6 mb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex gap-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex-1 btn-secondary"
            >
              上一步
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex-1 btn-primary"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 btn-warning flex items-center justify-center gap-2"
            >
              <Sun size={18} />
              开始晾晒
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecord;

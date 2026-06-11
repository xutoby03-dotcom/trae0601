import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Eye,
  Barcode,
  Package,
  Zap,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useAppStore } from '../store/useAppStore';
import { formatDate, formatMoney } from '../utils';
import type { ExceptionType, ExceptionSeverity, LoanAccessory } from '../types';

interface Step {
  id: number;
  name: string;
  icon: typeof Eye;
  description: string;
}

const steps: Step[] = [
  { id: 0, name: '外观检查', icon: Eye, description: '检查机身外观是否有划痕、变形等' },
  { id: 1, name: '序列号核对', icon: Barcode, description: '确认机身序列号与档案一致' },
  { id: 2, name: '配件清点', icon: Package, description: '逐项核对配件清单，确认数量' },
  { id: 3, name: '通电测试', icon: Zap, description: '开机验证基本功能是否正常' },
];

interface AccessoryReturn {
  id: string;
  name: string;
  loanQuantity: number;
  returnQuantity: number;
}

export default function ReturnCheck() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLoanById, returnLoan } = useAppStore();

  const loan = getLoanById(id || '');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<(boolean | null)[]>([null, null, null, null]);
  const [stepNotes, setStepNotes] = useState<string[]>(['', '', '', '']);

  const [appearanceOk, setAppearanceOk] = useState<boolean | null>(null);
  const [appearanceNote, setAppearanceNote] = useState('');

  const [serialOk, setSerialOk] = useState<boolean | null>(null);
  const [serialNote, setSerialNote] = useState('');

  const [accessories, setAccessories] = useState<AccessoryReturn[]>(
    loan?.loanAccessories.map((acc: LoanAccessory) => ({
      id: acc.id,
      name: acc.name,
      loanQuantity: acc.quantity,
      returnQuantity: acc.quantity,
    })) || []
  );
  const [accessoriesNote, setAccessoriesNote] = useState('');

  const [powerOk, setPowerOk] = useState<boolean | null>(null);
  const [powerNote, setPowerNote] = useState('');

  const [hasDamage, setHasDamage] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [damageSeverity, setDamageSeverity] = useState<ExceptionSeverity>('medium');

  if (!loan) {
    return (
      <PageContainer title="归还验收" subtitle="记录不存在">
        <div className="text-center py-16 text-gray-500">借出记录不存在</div>
      </PageContainer>
    );
  }

  const device = loan.device;
  const customer = loan.customer;

  const isCurrentStepComplete = () => {
    switch (currentStep) {
      case 0:
        return appearanceOk !== null;
      case 1:
        return serialOk !== null;
      case 2:
        return true;
      case 3:
        return powerOk !== null;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const results = [...stepResults];
      switch (currentStep) {
        case 0:
          results[0] = appearanceOk || false;
          break;
        case 1:
          results[1] = serialOk || false;
          break;
        case 2:
          results[2] = accessories.every((a) => a.returnQuantity >= a.loanQuantity);
          break;
        case 3:
          results[3] = powerOk || false;
          break;
      }
      setStepResults(results);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const hasMissingAccessories = () => {
    return accessories.some((a) => a.returnQuantity < a.loanQuantity);
  };

  const handleComplete = () => {
    const returnedAccessories = accessories.map((a) => ({
      id: a.id,
      returnQuantity: a.returnQuantity,
    }));

    const exceptions: {
      type: ExceptionType;
      description: string;
      severity: ExceptionSeverity;
      loanId: string;
      handlerId?: string;
    }[] = [];

    if (appearanceOk === false && appearanceNote) {
      exceptions.push({
        type: 'damage',
        description: appearanceNote,
        severity: 'medium',
        loanId: loan.id,
      });
    }

    if (serialOk === false && serialNote) {
      exceptions.push({
        type: 'other',
        description: `序列号不匹配: ${serialNote}`,
        severity: 'high',
        loanId: loan.id,
      });
    }

    if (hasMissingAccessories()) {
      const missing = accessories
        .filter((a) => a.returnQuantity < a.loanQuantity)
        .map((a) => `${a.name} 缺少 ${a.loanQuantity - a.returnQuantity} 件`)
        .join('，');
      exceptions.push({
        type: 'accessory_missing',
        description: missing,
        severity: 'medium',
        loanId: loan.id,
      });
    }

    if (powerOk === false && powerNote) {
      exceptions.push({
        type: 'malfunction',
        description: powerNote,
        severity: 'high',
        loanId: loan.id,
      });
    }

    returnLoan(loan.id, returnedAccessories, exceptions);
    navigate(`/loans/${loan.id}`);
  };

  const updateAccessoryQuantity = (index: number, delta: number) => {
    setAccessories((prev) =>
      prev.map((acc, i) => {
        if (i !== index) return acc;
        const newQty = Math.max(0, acc.returnQuantity + delta);
        return { ...acc, returnQuantity: newQty };
      })
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">请仔细检查样机外观是否有划痕、磕碰、变形等损坏情况。</p>

            <div className="flex gap-4">
              <button
                onClick={() => setAppearanceOk(true)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  appearanceOk === true
                    ? 'border-success-500 bg-success-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      appearanceOk === true ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-gray-800">外观完好</span>
                </div>
              </button>

              <button
                onClick={() => setAppearanceOk(false)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  appearanceOk === false
                    ? 'border-danger-500 bg-danger-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      appearanceOk === false ? 'bg-danger-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <XCircle className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-gray-800">有损坏</span>
                </div>
              </button>
            </div>

            {appearanceOk === false && (
              <div className="animate-fadeIn">
                <label className="label-base">损坏描述</label>
                <textarea
                  value={appearanceNote}
                  onChange={(e) => setAppearanceNote(e.target.value)}
                  placeholder="请描述损坏情况..."
                  rows={3}
                  className="input-base resize-none"
                />
                <p className="text-xs text-danger-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  将自动生成外观损坏异常单
                </p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">请核对机身序列号是否与档案记录一致。</p>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-gray-500 mb-2">档案序列号</p>
              <p className="text-xl font-mono font-bold text-gray-800">{device?.serialNo}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSerialOk(true)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  serialOk === true
                    ? 'border-success-500 bg-success-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      serialOk === true ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-gray-800">序列号一致</span>
                </div>
              </button>

              <button
                onClick={() => setSerialOk(false)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  serialOk === false
                    ? 'border-danger-500 bg-danger-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      serialOk === false ? 'bg-danger-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <XCircle className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-gray-800">不一致</span>
                </div>
              </button>
            </div>

            {serialOk === false && (
              <div className="animate-fadeIn">
                <label className="label-base">实际序列号</label>
                <input
                  type="text"
                  value={serialNote}
                  onChange={(e) => setSerialNote(e.target.value)}
                  placeholder="请输入实际机身序列号"
                  className="input-base font-mono"
                />
                <p className="text-xs text-danger-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  将自动生成序列号异常单
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">请逐项清点配件数量，与借出时核对。</p>

            <div className="space-y-3">
              {accessories.map((acc, index) => {
                const isMissing = acc.returnQuantity < acc.loanQuantity;
                return (
                  <div
                    key={acc.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isMissing ? 'bg-danger-50 border border-danger-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isMissing ? 'bg-danger-100' : 'bg-white'
                        }`}
                      >
                        <Package
                          className={`w-5 h-5 ${isMissing ? 'text-danger-600' : 'text-gray-400'}`}
                        />
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{acc.name}</span>
                        {isMissing && (
                          <p className="text-xs text-danger-500">缺少 {acc.loanQuantity - acc.returnQuantity} 件</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        借出: <span className="font-medium text-gray-700">{acc.loanQuantity}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateAccessoryQuantity(index, -1)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <span className="text-lg">-</span>
                        </button>
                        <span
                          className={`w-12 text-center font-bold ${
                            isMissing ? 'text-danger-600' : 'text-gray-800'
                          }`}
                        >
                          {acc.returnQuantity}
                        </span>
                        <button
                          onClick={() => updateAccessoryQuantity(index, 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMissingAccessories() && (
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                <p className="text-sm text-warning-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  检测到配件缺失，将自动生成异常单
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">请开机测试，验证设备基本功能是否正常。</p>

            <div className="flex gap-4">
              <button
                onClick={() => setPowerOk(true)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  powerOk === true
                    ? 'border-success-500 bg-success-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      powerOk === true ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Zap className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-gray-800">功能正常</span>
                </div>
              </button>

              <button
                onClick={() => setPowerOk(false)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  powerOk === false
                    ? 'border-danger-500 bg-danger-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      powerOk === false ? 'bg-danger-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <XCircle className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-gray-800">有故障</span>
                </div>
              </button>
            </div>

            {powerOk === false && (
              <div className="animate-fadeIn">
                <label className="label-base">故障描述</label>
                <textarea
                  value={powerNote}
                  onChange={(e) => setPowerNote(e.target.value)}
                  placeholder="请描述故障现象..."
                  rows={3}
                  className="input-base resize-none"
                />
                <p className="text-xs text-danger-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  将自动生成功能故障异常单
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const allPassed =
    appearanceOk === true &&
    serialOk === true &&
    !hasMissingAccessories() &&
    powerOk === true;

  const hasAnyIssue =
    appearanceOk === false ||
    serialOk === false ||
    hasMissingAccessories() ||
    powerOk === false;

  return (
    <PageContainer title="归还验收" subtitle={device?.name || ''}>
      <button
        onClick={() => navigate(`/loans/${loan.id}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回借出详情
      </button>

      <div className="max-w-4xl mx-auto">
        {/* 样机信息 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{device?.name}</h3>
                <p className="text-sm text-gray-500">
                  {device?.deviceNo} · 客户: {customer?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">借出日期</p>
              <p className="font-medium text-gray-800">{formatDate(loan.loanDate)}</p>
            </div>
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = stepResults[index] !== null;
              const isPassed = stepResults[index] === true;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary-900 text-white shadow-lg scale-110'
                          : isCompleted
                          ? isPassed
                            ? 'bg-success-500 text-white'
                            : 'bg-danger-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        isPassed ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <X className="w-6 h-6" />
                        )
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-primary-900' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${
                        isCompleted ? 'bg-success-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="bg-white rounded-xl shadow-card p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              步骤 {currentStep + 1}: {steps[currentStep].name}
            </h2>
            <p className="text-gray-500">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </div>

        {/* 汇总预览（最后一步） */}
        {currentStep === 3 && hasAnyIssue && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-6 mb-6">
            <h4 className="font-medium text-warning-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              检测到以下异常
            </h4>
            <ul className="space-y-2 text-sm text-warning-700">
              {appearanceOk === false && <li>• 外观检查未通过</li>}
              {serialOk === false && <li>• 序列号核对未通过</li>}
              {hasMissingAccessories() && <li>• 配件数量不匹配</li>}
              {powerOk === false && <li>• 通电测试未通过</li>}
            </ul>
            <p className="text-xs text-warning-600 mt-3">
              系统将自动生成相应的异常单，请后续跟进处理。
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            上一步
          </button>

          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                disabled={!isCurrentStepComplete()}
                className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  isCurrentStepComplete()
                    ? 'bg-primary-900 text-white hover:bg-primary-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 bg-primary-900 text-white hover:bg-primary-800 transition-all"
              >
                <Check className="w-4 h-4" />
                完成归还
              </button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

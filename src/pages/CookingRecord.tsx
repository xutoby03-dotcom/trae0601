import { useState } from 'react';
import { Plus, Minus, Check, ChefHat, Clock } from 'lucide-react';
import { usePotStore } from '../store/usePotStore';
import { Card } from '../components/ui';
import { TasteBadge, StatusBadge } from '../components/badges';
import { cn } from '../lib/utils';
import type { TasteResult } from '../types';

interface IngredientInputProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

function IngredientInput({ label, unit, value, onChange, step = 100 }: IngredientInputProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
      <span className="text-stone-700 font-medium text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="w-8 h-8 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center transition-colors"
        >
          <Minus className="w-4 h-4 text-stone-500" />
        </button>
        <div className="text-center min-w-[80px]">
          <span className="text-xl font-bold font-mono text-stone-800">{value}</span>
          <span className="text-xs text-stone-500 ml-1">{unit}</span>
        </div>
        <button
          onClick={() => onChange(value + step)}
          className="w-8 h-8 rounded-lg bg-braised-red-500 hover:bg-braised-red-600 flex items-center justify-center transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const tasteOptions: { value: TasteResult; label: string; icon: string }[] = [
  { value: 'normal', label: '味道正常', icon: '👍' },
  { value: 'light', label: '味道偏淡', icon: '😶' },
  { value: 'salty', label: '味道偏咸', icon: '🥵' },
  { value: 'weak', label: '香味不足', icon: '👃' },
];

export default function CookingRecord() {
  const { pots, addCookingRecord, currentOperator, setSelectedPotId } = usePotStore();
  const [selectedPotId, setLocalPotId] = useState(pots[0]?.id || '');
  const [waterAmount, setWaterAmount] = useState(2000);
  const [saltAmount, setSaltAmount] = useState(30);
  const [sugarAmount, setSugarAmount] = useState(50);
  const [spicePackCount, setSpicePackCount] = useState(1);
  const [stockAmount, setStockAmount] = useState(500);
  const [tasteResult, setTasteResult] = useState<TasteResult>('normal');
  const [remark, setRemark] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedPot = pots.find((p) => p.id === selectedPotId);

  const allRecords = pots
    .flatMap((pot) =>
      pot.cookingRecords.map((record) => ({
        ...record,
        potName: pot.name,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSubmit = () => {
    addCookingRecord(selectedPotId, {
      operator: currentOperator,
      waterAmount,
      saltAmount,
      sugarAmount,
      spicePackCount,
      stockAmount,
      tasteResult,
      remark: remark || undefined,
    });

    setSelectedPotId(selectedPotId);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setWaterAmount(2000);
    setSaltAmount(30);
    setSugarAmount(50);
    setSpicePackCount(1);
    setStockAmount(500);
    setTasteResult('normal');
    setRemark('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">续煮记录</h1>
          <p className="text-stone-500 mt-1">记录投料和试味结果，保持每锅风味稳定</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg animate-slide-up">
            <Check className="w-5 h-5" />
            <span className="font-medium">记录已保存</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="续锅投料">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                选择卤锅
              </label>
              <div className="grid grid-cols-3 gap-2">
                {pots.map((pot) => (
                  <button
                    key={pot.id}
                    onClick={() => {
                      setLocalPotId(pot.id);
                      setSelectedPotId(pot.id);
                    }}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all text-left',
                      selectedPotId === pot.id
                        ? 'border-braised-red-500 bg-braised-red-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    <p className="font-medium text-stone-800">{pot.name}</p>
                    <div className="mt-1">
                      <StatusBadge status={pot.status} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedPot && (
              <div className="p-3 bg-stone-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">当前汤位</p>
                  <p className="text-lg font-bold font-mono text-stone-800">
                    {selectedPot.soupLevel}%
                  </p>
                </div>
                <div className="h-10 w-24 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      selectedPot.soupLevel < 30
                        ? 'bg-red-500'
                        : selectedPot.soupLevel < 50
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    )}
                    style={{ width: `${selectedPot.soupLevel}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <IngredientInput
                label="加水"
                unit="ml"
                value={waterAmount}
                onChange={setWaterAmount}
                step={500}
              />
              <IngredientInput
                label="加盐"
                unit="g"
                value={saltAmount}
                onChange={setSaltAmount}
                step={5}
              />
              <IngredientInput
                label="加糖色"
                unit="g"
                value={sugarAmount}
                onChange={setSugarAmount}
                step={10}
              />
              <IngredientInput
                label="加香料包"
                unit="包"
                value={spicePackCount}
                onChange={setSpicePackCount}
                step={1}
              />
              <IngredientInput
                label="加老汤"
                unit="ml"
                value={stockAmount}
                onChange={setStockAmount}
                step={200}
              />
            </div>
          </div>
        </Card>

        <Card title="试味结果">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                味道评价
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tasteOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTasteResult(option.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      tasteResult === option.value
                        ? 'border-braised-red-500 bg-braised-red-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <p className="mt-2 font-medium text-stone-800">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                备注
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="记录一下特别的操作或发现..."
                className="w-full h-24 px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-braised-red-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-stone-500">
                <ChefHat className="w-4 h-4 inline mr-1" />
                操作员：{currentOperator}
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-braised-red-600 hover:bg-braised-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                保存记录
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card title="历史续煮流水">
        {allRecords.length === 0 ? (
          <p className="text-stone-400 text-center py-8">暂无续煮记录</p>
        ) : (
          <div className="space-y-0">
            {allRecords.map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  'py-4 border-b border-stone-100 last:border-0',
                  index === 0 && 'bg-braised-red-50/30 -mx-5 px-5 -mt-5 pt-5'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span className="text-sm text-stone-600">
                      {new Date(record.timestamp).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="px-2 py-0.5 bg-braised-red-100 text-braised-red-700 text-xs rounded-full font-medium">
                      {record.potName}
                    </span>
                    <span className="text-stone-400 text-sm">·</span>
                    <span className="text-sm text-stone-600">{record.operator}</span>
                  </div>
                  <TasteBadge taste={record.tasteResult} size="sm" />
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-stone-400">加水</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">
                      {record.waterAmount}ml
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400">加盐</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">
                      {record.saltAmount}g
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400">糖色</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">
                      {record.sugarAmount}g
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400">香料</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">
                      {record.spicePackCount}包
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400">老汤</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">
                      {record.stockAmount}ml
                    </p>
                  </div>
                </div>
                {record.remark && (
                  <p className="mt-2 text-xs text-stone-500 bg-stone-50 px-3 py-2 rounded">
                    💡 {record.remark}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

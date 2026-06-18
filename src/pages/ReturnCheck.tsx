import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertTriangle, Droplets, Wrench, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { DAMAGE_LEVEL_LABELS } from '../types';
import type { DamageLevel } from '../types';
import { formatDate } from '../utils/helpers';
import { cn } from '../lib/utils';

interface CheckItemProps {
  label: string;
  description: string;
  checked: boolean;
  level: DamageLevel;
  onCheckedChange: (v: boolean) => void;
  onLevelChange: (v: DamageLevel) => void;
  severity?: 'normal' | 'danger';
}

function CheckItem({ label, description, checked, level, onCheckedChange, onLevelChange, severity = 'normal' }: CheckItemProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border-2 transition-all duration-200',
        checked
          ? severity === 'danger'
            ? 'border-red-200 bg-red-50/50'
            : 'border-amber-200 bg-amber-50/50'
          : 'border-gray-100 bg-white'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {severity === 'danger' && checked && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span
              className={cn(
                'font-medium text-sm',
                checked ? (severity === 'danger' ? 'text-red-700' : 'text-amber-700') : 'text-gray-700'
              )}
            >
              {label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
            checked
              ? severity === 'danger'
                ? 'bg-red-500'
                : 'bg-amber-500'
              : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>
      {checked && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-500 mb-2">严重程度</p>
          <div className="flex gap-2">
            {(['minor', 'moderate', 'severe'] as DamageLevel[]).map((lv) => (
              <button
                key={lv}
                onClick={() => onLevelChange(lv)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  level === lv
                    ? severity === 'danger'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {DAMAGE_LEVEL_LABELS[lv]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReturnCheck() {
  const navigate = useNavigate();
  const { lendingId } = useParams<{ lendingId: string }>();
  const { lendings, coats, returnLending } = useStore();

  const lending = lendings.find((l) => l.id === lendingId);
  const coat = lending ? coats.find((c) => c.id === lending.coatId) : undefined;

  const [checks, setChecks] = useState({
    hasStain: false,
    hasHole: false,
    missingButton: false,
    pocketResidue: false,
    contactHazard: false,
  });

  const [levels, setLevels] = useState({
    stainLevel: 'minor' as DamageLevel,
    holeLevel: 'minor' as DamageLevel,
    buttonLevel: 'minor' as DamageLevel,
  });

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!lending && lendingId) {
      navigate('/return');
    }
  }, [lending, lendingId, navigate]);

  const needCleaning = useMemo(() => {
    return checks.hasStain || checks.hasHole || checks.missingButton || checks.pocketResidue || checks.contactHazard;
  }, [checks]);

  const needRepair = useMemo(() => {
    return (checks.hasHole && (levels.holeLevel === 'moderate' || levels.holeLevel === 'severe')) ||
      (checks.missingButton && (levels.buttonLevel === 'moderate' || levels.buttonLevel === 'severe'));
  }, [checks, levels]);

  const handleSubmit = () => {
    if (!lending) return;
    returnLending(lending.id, {
      ...checks,
      ...levels,
      notes,
      photos: [],
      needCleaning,
      needRepair,
    });
    navigate('/lendings');
  };

  if (!lending || !coat) {
    return (
      <div className="space-y-6">
        <Link to="/lendings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          返回领用列表
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <p className="text-gray-500">未找到对应的领用记录</p>
          <Link to="/lendings" className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm">
            去领用列表选择 →
          </Link>
        </div>
      </div>
    );
  }

  const hasAnyIssue = Object.values(checks).some(Boolean);

  return (
    <div className="space-y-6">
      <Link to="/lendings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        返回领用列表
      </Link>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">归还检查</p>
            <h2 className="text-2xl font-bold text-white">{coat.code}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-blue-200 text-sm">{coat.size} · {coat.lab}</span>
              <StatusBadge type="coat" status={coat.status} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">领用人</p>
            <p className="text-white font-semibold text-lg">{lending.studentName}</p>
            <p className="text-blue-200 text-sm">{lending.studentId}</p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-blue-500/30 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-300 text-xs">课程</p>
            <p className="text-white font-medium mt-0.5">{lending.course || '-'}</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs">任课教师</p>
            <p className="text-white font-medium mt-0.5">{lending.teacher || '-'}</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs">领用日期</p>
            <p className="text-white font-medium mt-0.5">{formatDate(lending.experimentDate)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          外观状况检查
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckItem
            label="污渍"
            description="检查袖口、领口、前襟等是否有污渍"
            checked={checks.hasStain}
            level={levels.stainLevel}
            onCheckedChange={(v) => setChecks({ ...checks, hasStain: v })}
            onLevelChange={(v) => setLevels({ ...levels, stainLevel: v })}
          />
          <CheckItem
            label="破洞"
            description="检查布料是否有破损、撕裂"
            checked={checks.hasHole}
            level={levels.holeLevel}
            onCheckedChange={(v) => setChecks({ ...checks, hasHole: v })}
            onLevelChange={(v) => setLevels({ ...levels, holeLevel: v })}
          />
          <CheckItem
            label="扣子缺失"
            description="检查所有扣子是否完整"
            checked={checks.missingButton}
            level={levels.buttonLevel}
            onCheckedChange={(v) => setChecks({ ...checks, missingButton: v })}
            onLevelChange={(v) => setLevels({ ...levels, buttonLevel: v })}
          />
          <CheckItem
            label="口袋残留"
            description="检查口袋内是否有遗留物品"
            checked={checks.pocketResidue}
            level="minor"
            onCheckedChange={(v) => setChecks({ ...checks, pocketResidue: v })}
            onLevelChange={() => {}}
          />
          <CheckItem
            label="接触危险试剂"
            description="是否接触过强酸、强碱、有毒试剂等"
            checked={checks.contactHazard}
            level="severe"
            onCheckedChange={(v) => setChecks({ ...checks, contactHazard: v })}
            onLevelChange={() => {}}
            severity="danger"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">检查备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="记录其他检查情况或说明..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className={cn(
        'rounded-xl border-2 p-5 shadow-sm',
        hasAnyIssue ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
      )}>
        <h4 className={cn(
          'text-sm font-semibold mb-3 flex items-center gap-2',
          hasAnyIssue ? 'text-amber-700' : 'text-emerald-700'
        )}>
          <Check className="w-4 h-4" />
          检查结果处理建议
        </h4>
        <div className="flex flex-wrap gap-3">
          {needCleaning && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
              <Droplets className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 font-medium">需要清洗</span>
            </div>
          )}
          {needRepair && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-lg">
              <Wrench className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700 font-medium">需要维修</span>
            </div>
          )}
          {!needCleaning && !needRepair && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-lg">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">状态良好，可直接上架</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => navigate('/lendings')}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25"
        >
          确认归还
        </button>
      </div>
    </div>
  );
}

export function ReturnList() {
  const navigate = useNavigate();
  const { lendings, coats, updateOverdueStatus } = useStore();

  useEffect(() => {
    updateOverdueStatus();
  }, [updateOverdueStatus]);

  const activeLendings = useMemo(() => {
    return lendings
      .filter((l) => l.status === 'active' || l.status === 'overdue')
      .sort((a, b) => a.expectedReturn.localeCompare(b.expectedReturn));
  }, [lendings]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">待归还实验服</h3>
        {activeLendings.length > 0 ? (
          <div className="space-y-3">
            {activeLendings.map((lending) => {
              const coat = coats.find((c) => c.id === lending.coatId);
              return (
                <div
                  key={lending.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{coat?.code || '-'}</p>
                        <StatusBadge type="lending" status={lending.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lending.studentName} ({lending.studentId}) · {lending.course || '未登记课程'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">预计归还</p>
                      <p className="text-sm text-gray-700">{formatDate(lending.expectedReturn)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/return/${lending.id}`)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25"
                    >
                      开始检查
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            暂无待归还的实验服
          </div>
        )}
      </div>
    </div>
  );
}

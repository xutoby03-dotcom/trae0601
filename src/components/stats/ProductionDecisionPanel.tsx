import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import { getProductionReadiness } from '@/utils/statistics';
import { useStore } from '@/store';
import { ProductionStatus } from '@/types';
import { getProductionStatusLabel, getProductionStatusColor } from '@/utils/format';

interface ProductionDecisionPanelProps {
  sampleId: string;
}

export default function ProductionDecisionPanel({ sampleId }: ProductionDecisionPanelProps) {
  const sample = useStore((state) => state.getSampleById(sampleId));
  const updateProductionStatus = useStore((state) => state.updateProductionStatus);

  const [note, setNote] = useState(sample?.productionNote || '');

  const readiness = useMemo(() => getProductionReadiness(sampleId), [sampleId]);

  const scoreColor = useMemo(() => {
    if (readiness.score >= 80) return 'bg-moss-500';
    if (readiness.score >= 60) return 'bg-champagne-500';
    if (readiness.score >= 40) return 'bg-terracotta-300';
    return 'bg-terracotta-500';
  }, [readiness.score]);

  const scoreTextColor = useMemo(() => {
    if (readiness.score >= 80) return 'text-moss-600';
    if (readiness.score >= 60) return 'text-champagne-600';
    if (readiness.score >= 40) return 'text-terracotta-500';
    return 'text-terracotta-600';
  }, [readiness.score]);

  const handleApprove = () => {
    updateProductionStatus(sampleId, 'approved' as ProductionStatus, note);
  };

  const handleReject = () => {
    updateProductionStatus(sampleId, 'rejected' as ProductionStatus, note);
  };

  if (!sample) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-charcoal-800 font-display">大货生产决策</h3>
          <Tag variant="status" className={getProductionStatusColor(sample.productionStatus)}>
            {getProductionStatusLabel(sample.productionStatus)}
          </Tag>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-charcoal-600">就绪度评分</span>
          <span className={`text-2xl font-bold ${scoreTextColor}`}>{readiness.score}</span>
        </div>
        <div className="w-full h-3 bg-cream-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${scoreColor} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${readiness.score}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          {readiness.ready ? (
            <CheckCircle className="w-4 h-4 text-moss-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-terracotta-500" />
          )}
          <span className={`text-sm ${readiness.ready ? 'text-moss-600' : 'text-terracotta-600'}`}>
            {readiness.ready ? '建议通过，可进入大货生产阶段' : '建议驳回，需继续优化调整'}
          </span>
        </div>
      </div>

      {readiness.issues.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-champagne-600" />
            <span className="text-sm font-medium text-charcoal-700">风险问题</span>
          </div>
          <ul className="space-y-2">
            {readiness.issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2 p-3 bg-champagne-50 rounded border border-champagne-200">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-champagne-500 shrink-0" />
                <span className="text-sm text-charcoal-700">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-charcoal-500" />
          <label className="text-sm font-medium text-charcoal-700">决策备注</label>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="请输入决策备注说明..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="moss"
          size="md"
          onClick={handleApprove}
          icon={<CheckCircle className="w-4 h-4" />}
          disabled={sample.productionStatus === 'approved'}
        >
          通过大货生产
        </Button>
        <Button
          variant="terracotta"
          size="md"
          onClick={handleReject}
          icon={<XCircle className="w-4 h-4" />}
          disabled={sample.productionStatus === 'rejected'}
        >
          驳回需调整
        </Button>
      </div>
    </div>
  );
}

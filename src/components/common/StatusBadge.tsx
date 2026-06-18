import type { BatchStatus, FeedbackType, Severity, SkimStatus, SoupType, FireLevel } from '@/types';
import {
  BATCH_STATUS_COLOR,
  BATCH_STATUS_LABEL,
  FEEDBACK_TYPE_COLOR,
  FEEDBACK_TYPE_LABEL,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  SKIM_STATUS_COLOR,
  SKIM_STATUS_LABEL,
  SOUP_TYPE_COLOR,
  SOUP_TYPE_LABEL,
  FIRE_LEVEL_COLOR,
  FIRE_LEVEL_LABEL,
} from '@/utils/soupConfig';

interface Props {
  type: 'batch' | 'feedback' | 'severity' | 'skim' | 'soup' | 'fire';
  value: string;
}

export default function StatusBadge({ type, value }: Props) {
  const configMap: Record<Props['type'], { color: Record<string, string>; label: Record<string, string> }> = {
    batch: { color: BATCH_STATUS_COLOR, label: BATCH_STATUS_LABEL },
    feedback: { color: FEEDBACK_TYPE_COLOR, label: FEEDBACK_TYPE_LABEL },
    severity: { color: SEVERITY_COLOR, label: SEVERITY_LABEL },
    skim: { color: SKIM_STATUS_COLOR, label: SKIM_STATUS_LABEL },
    soup: { color: SOUP_TYPE_COLOR, label: SOUP_TYPE_LABEL },
    fire: { color: FIRE_LEVEL_COLOR, label: FIRE_LEVEL_LABEL },
  };

  const config = configMap[type];
  const label = config.label[value as BatchStatus & FeedbackType & Severity & SkimStatus & SoupType & FireLevel] || value;
  const color = config.color[value as BatchStatus & FeedbackType & Severity & SkimStatus & SoupType & FireLevel] || 'bg-gray-100 text-gray-600';

  return <span className={`chip ${color}`}>{label}</span>;
}

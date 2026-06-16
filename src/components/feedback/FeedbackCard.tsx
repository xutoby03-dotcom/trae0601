import { useState } from 'react';
import {
  User,
  Ruler,
  Activity,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Camera,
} from 'lucide-react';
import { Feedback, FeelLabel } from '@/types';
import Tag from '@/components/common/Tag';
import { formatDate, getFeelColor } from '@/utils/format';
import { cn } from '@/lib/utils';

interface FeedbackCardProps {
  feedback: Feedback;
}

function FeelBar({ label, level }: { label: string; level: 1 | 2 | 3 }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-charcoal-500">{label}</span>
        <span className={cn('font-medium', getFeelColor(level).split(' ')[0])}>
          {FeelLabel[level]}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-cream-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', getFeelColor(level).split(' ')[1])}
          style={{ width: level === 1 ? '33%' : level === 2 ? '66%' : '100%' }}
        />
      </div>
    </div>
  );
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cream-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-100">
            <User className="h-5 w-5 text-charcoal-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-charcoal-800">{feedback.wearerName}</span>
              <span className="text-sm text-charcoal-500">
                {feedback.height}cm / {feedback.weight}kg
              </span>
              <Tag variant="size">
                {feedback.usualSize} → {feedback.trySize}
              </Tag>
            </div>
            <div className="text-xs text-charcoal-400 mt-0.5">
              {formatDate(feedback.createdAt)}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-cream-100 text-charcoal-500"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-cream-100">
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
              <Ruler className="h-4 w-4" />
              身体部位感受
            </div>
            <FeelBar label="肩宽" level={feedback.shoulderFeel} />
            {feedback.shoulderNote && (
              <p className="text-xs text-charcoal-500 pl-4">{feedback.shoulderNote}</p>
            )}
            <FeelBar label="胸围" level={feedback.chestFeel} />
            {feedback.chestNote && (
              <p className="text-xs text-charcoal-500 pl-4">{feedback.chestNote}</p>
            )}
            <FeelBar label="腰围" level={feedback.waistFeel} />
            {feedback.waistNote && (
              <p className="text-xs text-charcoal-500 pl-4">{feedback.waistNote}</p>
            )}
          </div>

          {feedback.limitedActions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                <Activity className="h-4 w-4" />
                活动受限
              </div>
              <div className="flex flex-wrap gap-2">
                {feedback.limitedActions.map((action, i) => (
                  <Tag key={i} variant="comfort">
                    {action}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {feedback.problemTypes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                <MessageSquare className="h-4 w-4" />
                问题类型
              </div>
              <div className="flex flex-wrap gap-2">
                {feedback.problemTypes.map((type) => (
                  <Tag key={type} variant={type}>
                    {type === 'pattern' ? '版型' : type === 'fabric' ? '面料' : type === 'workmanship' ? '做工' : '舒适度'}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {feedback.problemDescription && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-charcoal-700">问题描述</div>
              <p className="text-sm text-charcoal-600 bg-cream-50 rounded-lg p-3 leading-relaxed">
                {feedback.problemDescription}
              </p>
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-charcoal-700">修改建议</div>
              <ul className="space-y-1">
                {feedback.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-charcoal-600 flex items-start gap-2">
                    <span className="text-moss-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                <Camera className="h-4 w-4" />
                试穿照片
              </div>
              <div className="flex flex-wrap gap-2">
                {feedback.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="h-20 w-20 rounded-lg overflow-hidden border border-cream-200 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={photo}
                      alt={`试穿照片 ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

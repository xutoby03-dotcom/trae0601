import { Link } from 'react-router-dom';
import { Calendar, Users, ChevronRight } from 'lucide-react';
import type { Sample } from '@/types';
import Tag from '@/components/common/Tag';
import { formatDate, getProductionStatusLabel, getProductionStatusColor } from '@/utils/format';
import { useStore } from '@/store';

interface SampleCardProps {
  sample: Sample;
}

export default function SampleCard({ sample }: SampleCardProps) {
  const { getFeedbacksBySample } = useStore();
  const feedbackCount = getFeedbacksBySample(sample.id).length;

  return (
    <Link to={`/sample/${sample.id}`} className="card card-hover block">
      <div className="relative">
        {sample.photos[0] ? (
          <img
            src={sample.photos[0]}
            alt={sample.styleNo}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-cream-100 text-charcoal-300">
            暂无图片
          </div>
        )}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center rounded-full bg-charcoal-800/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {sample.version}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-charcoal-800">
          {sample.styleNo}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <Tag variant="fabric">{sample.fabric}</Tag>
          {sample.sizes.map((size) => (
            <Tag key={size} variant="size">{size}</Tag>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-sm text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{sample.targetGroup}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(sample.sampleDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4" />
            <span>{feedbackCount} 条反馈</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getProductionStatusColor(sample.productionStatus)}`}
          >
            {getProductionStatusLabel(sample.productionStatus)}
          </span>
        </div>
      </div>
    </Link>
  );
}

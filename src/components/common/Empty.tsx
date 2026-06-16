import { ClipboardList } from 'lucide-react';

interface EmptyProps {
  description?: string;
}

export default function Empty({ description }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100">
        <ClipboardList className="h-8 w-8 text-charcoal-400" />
      </div>
      <p className="text-base font-medium text-charcoal-600">暂无数据</p>
      {description && (
        <p className="mt-1 text-sm text-charcoal-400">{description}</p>
      )}
    </div>
  );
}

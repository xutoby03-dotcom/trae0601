import { GitBranch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVersionChain } from '@/utils/statistics';
import { formatDate } from '@/utils/format';

interface VersionTimelineProps {
  sampleId: string;
}

export default function VersionTimeline({ sampleId }: VersionTimelineProps) {
  const chain = getVersionChain(sampleId);

  if (chain.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-cream-50 p-5">
      <div className="mb-4 flex items-center gap-2 text-charcoal-700">
        <GitBranch className="h-5 w-5" />
        <h3 className="font-display text-lg font-semibold">版本历史</h3>
      </div>

      <div className="relative pl-6">
        {chain.map((item, index) => {
          const isCurrent = item.id === sampleId;
          const isLast = index === chain.length - 1;

          return (
            <div key={item.id} className="relative pb-6 last:pb-0">
              {!isLast && (
                <div className="absolute left-[7px] top-6 h-full w-px bg-cream-300" />
              )}

              <div
                className={`absolute -left-0.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  isCurrent
                    ? 'border-moss-500 bg-moss-500'
                    : 'border-cream-400 bg-white'
                }`}
              >
                {isCurrent && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>

              <Link
                to={`/sample/${item.id}`}
                className={`block rounded-lg px-3 py-2 transition-colors duration-200 ${
                  isCurrent
                    ? 'bg-moss-50 ring-1 ring-moss-200'
                    : 'hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isCurrent
                        ? 'bg-moss-500 text-white'
                        : 'bg-cream-200 text-charcoal-600'
                    }`}
                  >
                    {item.version}
                  </span>
                  <span
                    className={`font-medium ${
                      isCurrent ? 'text-moss-700' : 'text-charcoal-700'
                    }`}
                  >
                    {item.styleNo}
                  </span>
                  {isCurrent && (
                    <ArrowRight className="h-4 w-4 text-moss-500" />
                  )}
                </div>
                <div className="mt-1 text-xs text-charcoal-400">
                  {formatDate(item.sampleDate)}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

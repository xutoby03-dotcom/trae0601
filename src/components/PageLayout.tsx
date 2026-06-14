import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  className?: string;
}

export default function PageLayout({
  children,
  title,
  showBack = false,
  rightAction,
  className,
}: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto bg-amber-50 min-h-screen">
        {(title || showBack || rightAction) && (
          <div className="sticky top-0 z-10 bg-amber-50/90 backdrop-blur-sm border-b border-amber-100">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="w-10">
                {showBack && (
                  <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-teal-700 hover:bg-teal-50 transition-colors"
                  >
                    <ChevronLeft size={24} strokeWidth={2} />
                  </button>
                )}
              </div>
              <h1 className="text-lg font-bold text-stone-800 font-serif">
                {title}
              </h1>
              <div className="w-10 flex justify-end">{rightAction}</div>
            </div>
          </div>
        )}
        <div className={cn('pb-8', className)}>{children}</div>
      </div>
    </div>
  );
}

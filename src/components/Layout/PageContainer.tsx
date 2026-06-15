import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
      <div className={`container py-6 md:py-8 ${className}`}>
        {children}
      </div>
    </main>
  );
}

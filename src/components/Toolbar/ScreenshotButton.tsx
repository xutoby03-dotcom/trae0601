import { useState } from 'react';

interface ScreenshotButtonProps {
  onClick: () => void;
}

export function ScreenshotButton({ onClick }: ScreenshotButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium 
                  rounded-lg transition-all flex items-center gap-2
                  ${isAnimating ? 'scale-95 bg-white/30' : ''}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      截图
    </button>
  );
}
